import prisma from "../../utils/prisma";

const toggleLike = async (userId: string, resourceId: string) => {
  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      resourceId,
    },
  });

  if (existingLike) {
    // Already liked → remove like
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    return {
      message: 'Like removed',
      liked: false,
    };
  }

  // Not liked yet → create like
  const newLike = await prisma.like.create({
    data: {
      userId,
      resourceId,
    },
  });

  return {
    message: 'Liked successfully',
    liked: true,
    data: newLike,
  };
};



const likeResourceOwner = async (userId: string) => {
  const result = await prisma.like.findMany({
    where: {
      userId,
      
    },
    include:{
      Resource:{include:{Author:{select:{firstName:true,lastName:true,id:true,userName:true,organizationName:true,email:true}}}}
    }
  });



  return {
    message: 'Liked successfully',
    liked: true,
    data: result,
  };
};




export const likeService={
  toggleLike,
  likeResourceOwner
}
