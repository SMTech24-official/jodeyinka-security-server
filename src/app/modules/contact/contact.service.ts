import Email from '../../utils/email';

const sendContactMessage = async (data: any) => {
  console.log('hellooo');

  await new Email({}).sendContactMail({});
  return;
};

export const contactServices = {
  sendContactMessage,
};
