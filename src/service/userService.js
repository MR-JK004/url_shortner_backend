import 'dotenv/config.js'
import userModel from '../model/userModel.js'
import crypto from 'crypto'
import Function from '../common/Function.js'
import nodeMailer from 'nodemailer'
import { validatePassword } from '../common/Validations.js'
import auth from '../common/Function.js'

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
});


const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character' 
            });
        }

        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await Function.hashPassword(password);
        user = await userModel.create({ ...req.body, password: hashedPassword });

        const randomString = crypto.randomBytes(8).toString('hex');
        user.activationToken = randomString;
        user.activationTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        const activationLink = `https://task-url-shortener-frontend.netlify.app/user/activation-link/${randomString}`;
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL,
            subject: 'Account Activation',
            html: `<p>Account Activation Link</p>
                   <p>Click this link to activate your account: <a href="${activationLink}">${activationLink}</a></p>`
        });

        res.status(200).json({ message: `Activation link sent to your email ${email}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const accountActivation = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const user = await userModel.findOne({
            activationToken: token,
            activationTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.activationToken = undefined;
        user.activationTokenExpiration = undefined;
        user.activityStatus = true;
        await user.save();

        res.status(200).send({
            message: "Account Activated Successfully",
            email: user.email
        });
    } catch (error) {
        console.error('Error in Account Activation:', error);
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await userModel.findOne({ email });
        if (user) {
            await user.deleteOne();
            res.status(200).send({ message: "User deleted successfully" });
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error",
            error
        });
    }
}


const authenticateUser = async(req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (user) {   
            if (await Function.hashCompare(req.body.password, user.password)) {
                if (user.activityStatus === true) {
                    let payload = {
                        email: user.email
                    };
                    let token = await auth.createToken(payload);

                    // Respond with both token and email
                    res.status(200).send({
                        message: "Login Successful",
                        token,
                        email: user.email
                    });
                } else {
                    res.status(400).send({
                        message: "Account is not activated"
                    });
                }
            } else {
                res.status(400).send({
                    message: "Incorrect Password"
                });
            }
        } else {
            res.status(400).send({
                message: "User does not exist"
            });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error",
            error
        });
    }
}


const forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found.' });
      }
  
      const randomString = crypto.randomBytes(32).toString('hex');
      user.resetToken = randomString;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();
  
      const resetLink = `https://task-url-shortener-frontend.netlify.app/reset-password/${randomString}`;
  
      await transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject: 'Reset Password',
        html: `<p>You requested a password reset</p>
              <p>Click this Password Reset Link: <a href="${resetLink}">${resetLink}</a> to Set a New Password</p>`
      });
  
      res.status(200).send(`Link Sent to Your Email ID ${req.body.email}`);
    } catch (error) {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message
      });
    }
  };



const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        
        const user = await userModel.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: '\n1) The Password must contain at least 8 characters\n2) One lowercase letter, one uppercase letter, one number, and one special character must be included' 
            });
        }

        
        user.password = await Function.hashPassword(password);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.status(200).send({
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export default {
    forgetPassword,
    resetPassword,
    createUser,
    authenticateUser,
    accountActivation,
    deleteUser
}