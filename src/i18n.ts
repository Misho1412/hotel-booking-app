import {getRequestConfig} from 'next-intl/server';
import { getMessages } from './i18n/getMessages';

export default getRequestConfig(async ({locale}) => {
  return {
    messages: await getMessages(locale)
  };
});