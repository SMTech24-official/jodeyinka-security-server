import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { calculatePagination } from '../../utils/calculatePagination';
import { FavouriteDBServices } from './favourite.service';




const createFavouriteIntoDB = catchAsync(async (req, res) => {

  console.log()



  
  const result = await FavouriteDBServices.createFavouriteIntoDB(req?.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
 
    message: result.message,
    data: result.data,
  });
});


const getFavourite = catchAsync(async (req, res) => {
   const{skip,limit,page}=  calculatePagination(req.query)

  const { data, total }  = await FavouriteDBServices.getFavouriteIntoDB(req?.params?.id,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'May Favourite retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });
});




export const FavouriteControllers = {
  createFavouriteIntoDB,
  getFavourite,


  
};
