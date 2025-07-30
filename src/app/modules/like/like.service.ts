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



// const likeResourceOwner = async (userId: string) => {
//   const result = await prisma.like.findMany({
//     where: {
//       userId,
      
//     },
//     include:{
//       Resource:{include:{Author:{select:{firstName:true,lastName:true,id:true,userName:true,organizationName:true,email:true,avatarUrl:true,Followers:true}}}}
//     }
//   });

//   const uniqueAuthorsMap = new Map();

// result.forEach((item) => {
//   const author = item?.Resource?.Author;
//   if (author && !uniqueAuthorsMap.has(author.id)) {
//     uniqueAuthorsMap.set(author.id, author);
//   }
// });

// const uniqueAuthors = Array.from(uniqueAuthorsMap.values());


//   return {
//     message: 'Liked successfully',
//     liked: true,
//     data: uniqueAuthors,
//   };
// };


const likeResourceOwner = async (userId: string) => {

  
  const result = await prisma.like.findMany({
    where: {
      userId,
    },
    include: {
      Resource: {
        include: {
          Author: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              userName: true,
              organizationName: true,
              email: true,
              avatarUrl: true,
              Followers: {
                select: {
                  id: true,
                  followerId: true,
                  followingId: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const uniqueAuthorsMap = new Map();

  result.forEach((item) => {
    const author = item?.Resource?.Author;
    if (author && !uniqueAuthorsMap.has(author?.id)) {
      uniqueAuthorsMap.set(author?.id, author);
    }
  });

  const uniqueAuthors = Array.from(uniqueAuthorsMap.values());

  const finalAuthors = uniqueAuthors.map((author) => {
    const isFollow = author?.Followers?.some(
      (follower:any) => follower?.followerId === userId
    );

    return {
      ...author,
      isFollow,
    };
  });

  return {
    message: 'Liked successfully',
    liked: true,
    data: finalAuthors,
  };
};



export const likeService={
  toggleLike,
  likeResourceOwner
}
