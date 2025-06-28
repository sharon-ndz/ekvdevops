import { setSeederFactory } from 'typeorm-extension';
import { DrivingSchool } from '../entities/driving-school.entity';
import { faker } from '@faker-js/faker';
import { Status } from '../core/constants/enums';
import { hexCode } from '../core/helpers/functions.helpers';

export default setSeederFactory(DrivingSchool, () => {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName('male');
  const name = faker.person.fullName({ firstName, lastName }) + ' ' + 'Driving School';
  const email = faker.internet.email({
    firstName,
    lastName,
    allowSpecialCharacters: false,
    provider: 'example.com',
  });
  const phone = faker.phone.number({
    style: 'international',
  });
  const identifier = hexCode({
    count: 8,
    caps: true,
    prefix: 'DR',
  });

  const lgas = [
    { id: 517, name: 'Lagos-Island' },
    { id: 518, name: 'Lagos-Mainland' },
    { id: 519, name: 'Mushin' },
    { id: 523, name: 'Surulere' },
    { id: 514, name: 'Ikeja' },
  ];
  const getRandomLga = (): any => {
    const randomIndex = Math.floor(Math.random() * lgas.length);
    return lgas[randomIndex];
  };

  // Generate a random index within the range of the lgas array
  const selectedLga: any = getRandomLga();

  const addressComponents = {
    streetAddress: faker.location.streetAddress(),
    city: selectedLga.name,
    state: 'Lagos State',
    zipCode: '23407',
    country: 'Nigeria',
  };

  const generateNigerianAddressString = (): string => {
    return `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state}, ${addressComponents.zipCode}, ${addressComponents.country}`;
  };

  const schoolObject = {
    name,
    email,
    phone,
    identifier,
    stateId: 25,
    lgaId: selectedLga.id,
    address: generateNigerianAddressString(),
    isActive: Status.Active,
  };
  const school = new DrivingSchool();
  return Object.assign(school, schoolObject);
});
