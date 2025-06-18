import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '..';
import { EmailNotification } from '../../../entities/email-notification.entity';
import { EmailStatus } from '../../../core/constants/enums';
import { createTransport } from 'nodemailer';

jest.setTimeout(30000);

export const mockSendMail = jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    envelope: {
      from: 'sender@example.com',
      to: ['recipient@example.com']
    }
  });
  
export const mockCreateTransport = jest.fn().mockReturnValue({
sendMail: mockSendMail
});


jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockImplementation(() => ({
        sendMail: jest.fn().mockResolvedValue({ 
            messageId: '12345',
            envelope: {
                from: 'sender@example.com',
                to: ['recipient@example.com']
              },
         }),
    })),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let emailRepository: Repository<EmailNotification>;

  const mockEmailRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(EmailNotification),
          useValue: mockEmailRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailRepository = module.get<Repository<EmailNotification>>(getRepositoryToken(EmailNotification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        from: 'sender@example.com',
        text: 'Test email',
        html: '<p>Test email</p>',
        subject: 'Test Subject',
        bcc: '',
      };

      const result = await service.sendEmail(emailData);
      expect(result).toBeDefined();
    });

    it('should throw error when email sending fails', async () => {
        // Mock the transporter to throw an error
        (createTransport as jest.Mock).mockReturnValueOnce({
          sendMail: jest.fn().mockRejectedValue(new Error('Email sending failed')),
        });
      process.env.EMAIL_HOST = 'invalid-host';
      const emailData = {
        to: 'test@example.com',
        from: 'sender@example.com',
        text: 'Test email',
        html: '<p>Test email</p>',
        subject: 'Test Subject',
        bcc: '',
      };

      await expect(service.sendEmail(emailData)).rejects.toThrow();
    });
  });

  describe('main', () => {
    it('should process notification successfully', async () => {
      const mockNotification = {
        id: 1,
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
        status: EmailStatus.Pending,
      };

      mockEmailRepository.findOne.mockResolvedValue(mockNotification);
      mockEmailRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.main(1);
      expect(result).toBe('Notification sent');
      expect(emailRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should handle non-existent notification', async () => {
      mockEmailRepository.findOne.mockResolvedValue(null);

      const result = await service.main(999);
      expect(result).toBe('Notification not found');
    });

    it('should handle failed notification', async () => {
      const mockNotification = {
        id: 1,
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
        status: EmailStatus.Pending,
      };

      mockEmailRepository.findOne.mockResolvedValue(mockNotification);
      mockEmailRepository.update.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await service.main(1);
      expect(result).toBe('Error while sending notification');
      expect(emailRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: EmailStatus.Failed }
      );
    });
  });
});