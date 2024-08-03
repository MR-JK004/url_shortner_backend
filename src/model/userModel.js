import mongoose from './index.js';
import {validateEmail} from '../common/Validations.js';

const userSchema = new mongoose.Schema({
    firstName : String,
    lastName:String,
    email: { 
        type: String, 
        unique: true ,
        validate:{
            validator: validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true
    },
    activityStatus:{
        type:Boolean,
        default:false
    },
    activationToken:String,
    activationTokenExpiration:String,
    resetToken: String,
    resetTokenExpiration: Date
});

const user = mongoose.model('user', userSchema);


export default user;
