import {Router} from 'express'
import userService from '../service/userService.js'
import urlService from '../service/urlService.js'
import authMiddleware from '../middleware/authMiddleWare.js';

const routes = Router();
routes.post('/user/forget-password',userService.forgetPassword)
routes.post('/user/reset-password',userService.resetPassword)
routes.post('/user/register',userService.createUser)
routes.post('/user/login',userService.authenticateUser)
routes.post('/user/activation-link',userService.accountActivation);
routes.delete('/user',userService.deleteUser);

routes.get('/url/daily-count',authMiddleware,urlService.getDailyUrlCount)
routes.get('/url/monthly-count',authMiddleware,urlService.getMonthlyUrlCount)
routes.get('/url/url-list',authMiddleware,urlService.getUrlList)
routes.post('/url/shorten',authMiddleware,urlService.createShortUrl)
routes.get('/url/:shortCode',urlService.shortCode)

export default routes