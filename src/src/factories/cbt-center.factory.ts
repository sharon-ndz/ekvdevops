import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { CbtCenter } from '../entities/cbt-center.entity';
import { Status } from '../core/constants/enums';

export default setSeederFactory(CbtCenter, () => {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName('male');
  const name = faker.person.fullName({ firstName, lastName }) + ' ' + 'CBT Center';
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

  const cbtCenterObject = {
    name,
    stateId: 25,
    lgaId: selectedLga.id,
    isActive: Status.Active,
  };
  const cbtCenter = new CbtCenter();
  return Object.assign(cbtCenter, cbtCenterObject);
});
