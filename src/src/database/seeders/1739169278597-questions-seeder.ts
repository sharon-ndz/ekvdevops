import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Question } from '../../entities/question.entity';
import AttachmentUtils from '../../core/helpers/aws.s3';

export class QuestionsSeeder1739169278597 implements Seeder {
  track = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const questionRepository = dataSource.getRepository(Question);
    const questions: any = [
      {
        questionText: 'The best way to convey accidents victims to the nearest hospital is by___?',
        options: [
          { id: 'A', text: 'Taxi' },
          { id: 'B', text: 'Motorcycle' },
          { id: 'C', text: 'Private' },
          { id: 'D', text: 'Ambulance' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'Overtaking in a curve is safe provided the Driver is fast',
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'Traction is important to car control. Which of the following types of traction is most dangerous?',
        options: [
          { id: 'A', text: 'Static traction' },
          { id: 'B', text: 'Sliding traction' },
          { id: 'C', text: 'Rolling traction' },
          { id: 'D', text: 'None' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'The roles and responsibilities of drivers are as follows except for one',
        options: [
          { id: 'A', text: 'Must observe defensive driving technique on the road' },
          { id: 'B', text: 'Insult wrong drivers' },
          { id: 'C', text: 'Communicate effectively' },
          { id: 'D', text: 'Have basic knowledge of auto mechanics' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'You have driven through a flood. What is the first thing you should do?',
        options: [
          { id: 'A', text: 'Switch on your windscreen wipers' },
          { id: 'B', text: 'Stop and check the tires' },
          { id: 'C', text: 'Stop and dry the brakes' },
          { id: 'D', text: 'Test your brake' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'When approaching a hazard your first reaction should be to',
        options: [
          { id: 'A', text: 'Check the mirrors' },
          { id: 'B', text: 'Change direction' },
          { id: 'C', text: 'Release the accelerator' },
          { id: 'D', text: 'Use footbrake' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText:
          'To pass a slower-moving vehicle on a two-lane road you must do all this except',
        options: [
          { id: 'A', text: 'Cross the centerline' },
          { id: 'B', text: 'Use the shoulder' },
          { id: 'C', text: 'Flash your lights' },
          { id: 'D', text: 'Use that lane that belongs to oncoming traffic' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'How many types of roundabouts do we have?',
        options: [
          { id: 'A', text: '4' },
          { id: 'B', text: '5' },
          { id: 'C', text: '1' },
          { id: 'D', text: '2' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'If there are no signals at a railroad crossing you should:',
        options: [
          { id: 'A', text: 'Slow down and prepare to stop' },
          { id: 'B', text: 'Proceed through the crossing at a normal rate' },
          {
            id: 'C',
            text: 'If you see or hear a train coming proceed as quickly as possible over the track',
          },
          { id: 'D', text: 'Proceed slowly over the tracks' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'To help a driver see better at night, the driver should:',
        options: [
          { id: 'A', text: 'Wear sunglasses to reduce headlight glare' },
          { id: 'B', text: 'Use high beam headlights when safe and legal to do so' },
          { id: 'C', text: 'Turn on all interior lights' },
          { id: 'D', text: 'Drive only in the city where there are street lights' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'One of the major factors of the causes of road traffic crashes',
        options: [
          { id: 'A', text: 'The road signs' },
          { id: 'B', text: 'The street lights' },
          { id: 'C', text: 'The driver' },
          { id: 'D', text: 'All of the above' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText:
          'If a vehicle using high beams comes towards you, you should look towards_____ of the road',
        options: [
          { id: 'A', text: 'Either side' },
          { id: 'B', text: 'The right side' },
          { id: 'C', text: 'The left side' },
          { id: 'D', text: 'B & C' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'Allowing a space cushion is important because it',
        options: [
          { id: 'A', text: 'Prevents distraction from other vehicles' },
          { id: 'B', text: 'Gives you time and space to react to a situation' },
          { id: 'C', text: 'Puts other drivers alert' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'The following are different parking except one:',
        options: [
          { id: 'A', text: 'Angle or angular parking' },
          { id: 'B', text: 'Car parking' },
          { id: 'C', text: 'Perpendicular parking' },
          { id: 'D', text: 'Parallel parking' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'Being overconfident can affect the performance of the driver and lead to an accident',
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'When driving on a highway, sudden strong crosswind gusts:',
        options: [
          { id: 'A', text: 'Always cause severe dust problems' },
          { id: 'B', text: 'Affect large cars more than small cars' },
          { id: 'C', text: 'Can move a car sideways into another lane' },
          { id: 'D', text: 'Do not affect a car as much as a strong headwind' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'If there are no signals at a railroad crossing you should:',
        options: [
          { id: 'A', text: 'Slow down and prepare to stop' },
          { id: 'B', text: 'Proceed through the crossing at a normal rate' },
          {
            id: 'C',
            text: 'If you see or hear a train coming proceed as quickly as possible over the track',
          },
          { id: 'D', text: 'Proceed slowly over the tracks' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'Preparing to smoke and smoking while driving',
        options: [
          { id: 'A', text: 'Do not affect driving abilities' },
          { id: 'B', text: 'Are distracting activities' },
          { id: 'C', text: "Help maintain a driver's alertness" },
          { id: 'D', text: 'Are not distracting activities' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'When a minor crash occurs, the first thing to do is to',
        options: [
          { id: 'A', text: 'Report to the police' },
          { id: 'B', text: 'Mark the position of the four tires' },
          { id: 'C', text: 'Stop the vehicle' },
          { id: 'D', text: 'Runaway from the accident scene' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'Before starting the engine of a vehicle you should:',
        options: [
          { id: 'A', text: 'Check radiator water level and engine oil level' },
          { id: 'B', text: 'Check headlight' },
          { id: 'C', text: 'Check the brakes' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'The middle lane is for what?',
        options: [
          { id: 'A', text: 'Overtaking' },
          { id: 'B', text: 'Traffic driving at 40 km/hr' },
          { id: 'C', text: 'Two wheelers' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'What does this road sign represent?',
        questionImage: 'img14.jpg',
        options: [
          { id: 'A', text: 'Approaching traffic passes you on both sides' },
          { id: 'B', text: 'Pass either sides to get to the same destination' },
          { id: 'C', text: 'Turn off at the next available junction' },
          { id: 'D', text: 'Give way to oncoming vehicles' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'You were driving, when you got to a junction, you found a stop sign with a solid white line on the road surface as seen in the image below. Why is there a stop sign at the junction?',
        questionImage: 'img16.jpg',
        options: [
          { id: 'A', text: 'It is a busy junction' },
          { id: 'B', text: 'Visibility among the major road is restricted' },
          { id: 'C', text: 'There are hazard warning lines in the centre of the road' },
          { id: 'D', text: 'Speed on the major road is de- restricted' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'Where will you find the road sign marking below?',
        questionImage: 'img17.jpg',
        options: [
          { id: 'A', text: 'On a pedestrian crossing' },
          { id: 'B', text: 'On a motorway' },
          { id: 'C', text: 'At a junction' },
          { id: 'D', text: 'At a railway crossing' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'What does the road sign below represent?',
        questionImage: 'img20.jpg',
        options: [
          { id: 'A', text: 'Motorway contraflow system ahead' },
          { id: 'B', text: 'Traffic approaching you have priority' },
          { id: 'C', text: 'Two-way traffic straight ahead' },
          { id: 'D', text: 'Two-way traffic ahead across a one way street' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText:
          'You are driving through a road, and all of a sudden you see the road sign below. What does this sign mean?',
        questionImage: 'img21.jpg',
        options: [
          { id: 'A', text: 'Overtaking on the left only' },
          { id: 'B', text: 'Move over onto the hard shoulder' },
          { id: 'C', text: 'Move to the lane on your left ' },
          { id: 'D', text: 'Leave the motorway at the next exit' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'Which of these is odd?',
        options: [
          { id: 'A', text: 'Seat belts' },
          { id: 'B', text: 'Clutch' },
          { id: 'C', text: 'Brake' },
          { id: 'D', text: 'Helmets' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'After starting a car, what is the next thing to do?',
        options: [
          { id: 'A', text: 'Touching your mirrors' },
          { id: 'B', text: 'Turning the wheel' },
          { id: 'C', text: 'Setting the transmission to the correct gear' },
          { id: 'D', text: 'Trying the acceleration gear' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'In which country were the first numeric speed limits created?',
        options: [
          { id: 'A', text: 'In the UK' },
          { id: 'B', text: 'In the USA' },
          { id: 'C', text: 'In the New Zealand' },
          { id: 'D', text: 'In Sweden' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'What does the road sign below represent?',
        questionImage: 'img24.jpg',
        options: [
          { id: 'A', text: 'Passing is permitted' },
          { id: 'B', text: 'No pedestrian allowed' },
          { id: 'C', text: 'Do not pass' },
          { id: 'D', text: 'Crowded movement not allowed' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'Which of the following road signs have blue and red colours in them?',
        options: [
          { id: 'A', text: 'Mandatory and information signs' },
          { id: 'B', text: 'Regulatory signs and no parking' },
          { id: 'C', text: 'No waiting and no stopping' },
          { id: 'D', text: 'No entry and no stopping' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'What is the offence code for operating a vehicle with forged documents?',
        options: [
          { id: 'A', text: 'OFD' },
          { id: 'B', text: 'OFV' },
          { id: 'C', text: 'OVF' },
          { id: 'D', text: 'FOV' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText:
          'The line drawn on the road as a result of emergency application of break is called?',
        options: [
          { id: 'A', text: 'Point of impact' },
          { id: 'B', text: 'Skid mark' },
          { id: 'C', text: 'Zebra mark' },
          { id: 'D', text: 'Point of collision' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'What is the last group in the list of driving license categories in Nigeria?',
        options: [
          { id: 'A', text: 'Group Z' },
          { id: 'B', text: 'Group V' },
          { id: 'C', text: 'Group J' },
          { id: 'D', text: 'Group A' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'Road traffic crashes are divided into three main categories, namely?',
        options: [
          { id: 'A', text: 'Major, severe and fatal' },
          { id: 'B', text: 'Minor, severe and fatal' },
          { id: 'C', text: 'Major, serious and fatal' },
          { id: 'D', text: 'Minor, serious and fatal' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText: 'Caution sign with red colour inverted triangles means?',
        options: [
          { id: 'A', text: 'Give Way' },
          { id: 'B', text: 'Go Ahead' },
          { id: 'C', text: 'Turn Left' },
          { id: 'D', text: 'Go Straight' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText: 'At the roundabout you give way to the traffic on the_______?',
        options: [
          { id: 'A', text: 'Right' },
          { id: 'B', text: 'Rear' },
          { id: 'C', text: 'Left' },
          { id: 'D', text: 'Front' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'To move a vehicle from a stationary position, the sequence of operation is:',
        options: [
          { id: 'A', text: 'Mirror-Start-Signal-Move' },
          { id: 'B', text: 'Start -Gear- Mirror -Signal -Move' },
          { id: 'C', text: 'Start -Mirror -Signal - Gear -Move' },
          { id: 'D', text: 'Signal -Start, Mirror - Move' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText:
          'There is a rule you need to take as to easily know if you are maintaining a safe driving distance. What is this rule called?',
        options: [
          { id: 'A', text: 'The three second rule' },
          { id: 'B', text: 'The half second rule' },
          { id: 'C', text: 'The one second rule' },
          { id: 'D', text: 'The two second rule' },
        ],
        correctAnswer: 'D',
      },
      {
        questionText:
          'At which of the traffic signals below may you move on if you are in the left-hand lane at traffic signals and you are waiting to turn left?',
        questionImage: 'img29.jpg',
        options: [
          { id: 'A', text: 'A' },
          { id: 'B', text: 'B' },
          { id: 'C', text: 'C' },
          { id: 'D', text: 'D' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'When near a pedestrian crossing,as the pedestrians are waiting to cross the road, what should you do?',
        options: [
          { id: 'A', text: 'Sound horn and proceed' },
          { id: 'B', text: 'Slow down, sound horn and pass' },
          {
            id: 'C',
            text: 'Stop the vehicle and wait till the pedestrians cross the road and then proceed.',
          },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText:
          'A person driving a vehicle in a public place without a license is liable for:',
        options: [
          { id: 'A', text: 'Penalty only' },
          {
            id: 'B',
            text: 'Penalty for the driver and the owner and/ or a seizure of the vehicle',
          },
          { id: 'C', text: 'Warning' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'While parking your vehicle on a downward gradient, in addition to the application of hand brake, the gear engaged should be:',
        options: [
          { id: 'A', text: 'In neutral' },
          { id: 'B', text: 'In first' },
          { id: 'C', text: 'In reverse' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText:
          'When a vehicle is involved in an accident causing injury to any person. What should you do?',
        options: [
          {
            id: 'A',
            text: 'Take the vehicle to the nearest police station and report the accident.',
          },
          { id: 'B', text: 'Stop the vehicle and report to the police station' },
          {
            id: 'C',
            text: 'Take all reasonable steps to secure medical attention to the injured and report to the nearest police station within 24 hours.',
          },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'On a road designated as one way, which of the following hold true?',
        options: [
          { id: 'A', text: 'Parking is prohibited' },
          { id: 'B', text: 'Overtaking is prohibited' },
          { id: 'C', text: 'Should not drive in reverse gear' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText:
          'When a blind person is crossing the road, holding a white cane, the driver should:',
        options: [
          { id: 'A', text: 'Consider the white cane as a traffic sign to stop the vehicle' },
          { id: 'B', text: 'Blow the horn and proceed' },
          { id: 'C', text: 'Slow down and proceed with caution' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'A',
      },
      {
        questionText:
          'When you reach an intersection where there is no signal light or a traffic policeman you should:',
        options: [
          { id: 'A', text: 'Give way to traffic approaching the intersection from other roads' },
          { id: 'B', text: 'Give proper signal, sound the horn and then proceed' },
          {
            id: 'C',
            text: 'Give way to the traffic approaching the intersection on your right side and proceed after giving necessary signals',
          },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'C',
      },
      {
        questionText: 'When is overtaking prohibited?',
        options: [
          {
            id: 'A',
            text: 'When the road is marked with a broken center line in the colour white',
          },
          { id: 'B', text: 'When the vehicle is being driven on a steep hill' },
          {
            id: 'C',
            text: 'When the road is marked with a continuous center line in the colour yellow',
          },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'What is the meaning of a blinking red traffic light?',
        options: [
          { id: 'A', text: 'Stop the vehicle till green light glows' },
          { id: 'B', text: 'Stop the vehicle and proceed if safe' },
          { id: 'C', text: 'Reduce speed and proceed' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText: 'Maximum permitted speed of a car on national highway is:',
        options: [
          { id: 'A', text: '60 km/hr' },
          { id: 'B', text: '70 km/hr' },
          { id: 'C', text: '80 km/hr' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'B',
      },
      {
        questionText:
          'Where is the number of passengers permitted to be taken in a private vehicle recorded?',
        options: [
          { id: 'A', text: 'Registration Certificate' },
          { id: 'B', text: 'Tax Token' },
          { id: 'C', text: 'Permit' },
          { id: 'D', text: 'None of the above' },
        ],
        correctAnswer: 'A',
      },
    ];

    // Clean existing record
    await questionRepository.delete({});
    // Go over each question
    for (const question of questions) {
      if (question.questionImage) {
        const imagePath = question.questionImage;
        // Convert file to base64 first
        const awsS3bucket = new AttachmentUtils();
        const base64: string = await awsS3bucket.localFileToBase64(imagePath);
        // Upload to S3
        if (base64) {
          await awsS3bucket.uploadBase64({
            base64String: base64,
            objectKey: imagePath,
            stringContent: true,
          });
        }
      }
      // Insert record in database
      await questionRepository.insert(question);
    }
  }
}
