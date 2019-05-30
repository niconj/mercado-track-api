import express, { Response, Request } from 'express';
import { CacheService } from '../../services';
import { Status } from '../article/article.constants';
import { CategoryRouteService } from './category.route.service';
import jwtDecode from 'jwt-decode';

export const categoryRouter = express.Router();

categoryRouter.route('/')
  .get(getCategories);

async function getCategories(_req: Request, res: Response) {
  // tslint:disable
  const getUserFromServerCookie = (req) => {
    if (!req.headers.cookie) {
      return undefined
    }
    const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('idToken='))
    if (!jwtCookie) {
      return undefined
    }
    const jwt = jwtCookie.split('=')[1]
    return jwtDecode(jwt)
  }

  console.log(getUserFromServerCookie(_req));

  if (CacheService.categories) {
    return res.send({ categories: CacheService.categories });
  }
  try {
    const categories = await CategoryRouteService.getCategoriesAggregated();
    res.send({ categories });
  } catch (error) {
    res.status(Status.Error).send({ error });
  }
}
