import { Favourite, PrismaClient } from '@prisma/client';





const prisma = new PrismaClient();


;

 const createFavouriteIntoDB = async (payload: Favourite | any) => {


  const FavouriteisExisting = await prisma.favourite.findFirst({
    where: {
      userId: payload.userId,

    favouriteUserId:payload.favouriteUserId
    },
  });

  if (FavouriteisExisting) {
    // Room already saved, remove it (toggle off)
      const data= await prisma.favourite.delete({
      where: {
        id: FavouriteisExisting.id,
      },

    
    });

    return {data,message:"Remove favourite  successfully"}
  } else {
    // Room not saved yet, create it (toggle on)
     const data= await prisma.favourite.create({
      data: payload,
    });
    return {data,message:"Added favourite  successfully"}
  }
};



const getFavouriteIntoDB = async (
  id: string,
  { skip, limit }: { skip: number; limit: number }
) => {
  const result = await prisma.favourite.findMany({
    where: { userId:id },
    skip,
    take: limit,
    include:{
      favouriteUser:true
    }
   
     
    
 
  });

  const total = await prisma.favourite.count({
    where: { userId: id },
  });

  return {
    data: result,
    total,
  };
};




export const FavouriteDBServices = {
  createFavouriteIntoDB,
  getFavouriteIntoDB,


};
