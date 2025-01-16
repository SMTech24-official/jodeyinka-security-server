import Email from '../../utils/email';

const sendContactMessage = async (data: any) => {
  await new Email({}).sendContactMail({ data });
  return;
};

export const contactServices = {
  sendContactMessage,
};
