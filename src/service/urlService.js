import Url from "../model/urlModel.js";
import shortid from 'shortid'
import { startOfMonth, endOfMonth} from 'date-fns';

const getDailyUrlCount = async (req, res) => {
  try {
    const {email} = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    const count = await Url.countDocuments({
      email: email,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getMonthlyUrlCount = async (req, res) => {
  try {
    const {email} = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const start = startOfMonth(new Date());
    const end = endOfMonth(start);

    const count = await Url.countDocuments({
      email:email,
      date: { $gte: start, $lt: end },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createShortUrl = async (req, res) => {
  const { originalUrl, title } = req.body;
  const email = req.email;

  if (!originalUrl) return res.status(400).json({ error: 'Original URL is required' });

  let shortCode;
  if (title) {
    shortCode = title.replace(/\s+/g, '-').toLowerCase();
  } else {
    shortCode = shortid.generate();
  }

  const shortUrl = `https://urlshortner-backend-08lq.onrender.com/url/${shortCode}`;
  const date = Date.now();

  try {
    const newUrl = new Url({ originalUrl, shortCode, title, date, email });
    await newUrl.save();
    res.json({ shortUrl });
  } catch (error) {
    if (error.code === 11000) { 
      console.error('Duplicate short code error:', error);
      res.status(409).json({ error: 'Short code already exists' });
    } else {
      res.status(500).json({ error });
    }
  }
};



const shortCode =async(req,res) => {
  const { shortCode } = req.params;
  try {
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error finding URL:', error);
    res.status(500).json({ error: 'Error finding URL' });
  }
}

const getUrlList = async(req,res) => {
  try {
     const {email} = req.query;

     if(!email){
      return res.status(400).json({ error: 'Email is required' });
     }

     const list = await Url.find({ email },{ originalUrl: 1, shortCode: 1, _id: 1,date:1});

     res.status(200).send({
        message:"Data Fetched Successfully",
        list
     })

  } catch (error) {
     res.status(500).send({
        message: error.message || 'Error Occured'
     })
  }
}

export default{
    getDailyUrlCount,
    getMonthlyUrlCount,
    createShortUrl,
    shortCode,
    getUrlList
}