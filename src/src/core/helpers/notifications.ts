import { SQS } from '@aws-sdk/client-sqs';
import { awsConstants } from '../constants/constants';
import { NotificationTypes } from '../constants/enums';

/**
 * AWS Queue
 * @param payload
 */
const enqueue = async (payload) => {
  try {
    const endpoint = `https://sqs.${awsConstants.region}.amazonaws.com/${awsConstants.accountId}/${awsConstants.notificationsQueueName}`;
    const sqs = new SQS({
      apiVersion: '2012-11-05',
      region: awsConstants.region,
      credentials: {
        accessKeyId: awsConstants.accessKeyId,
        secretAccessKey: awsConstants.secret,
      },
      endpoint,
    });
    console.log(payload);
    console.log('INSERTING IN QUEUE');
    const params = {
      MessageBody: JSON.stringify(payload),
      QueueUrl: endpoint,
    };

    console.log('QueueUrl', params.QueueUrl);
    const result = await sqs.sendMessage(params);
    console.log('Enqueue success', result.MessageId);
    return result;
  } catch (e) {
    console.log('Error while enqueue message', e);
  }
};

/**
 * Send email notification
 * @param id
 */
export const sendEmailNotification = async ({ id }): Promise<void> => {
  const payload = {
    type: NotificationTypes.Email,
    emailId: id,
  };

  await enqueue(payload);
};
