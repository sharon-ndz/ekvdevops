import Jimp from 'jimp';
import { Font } from '@jimp/plugin-print';
import { LicenseImageTemplate } from '../interfaces/all.interface';
import { HindFont } from '../constants/constants';

function removeMimeTypePrefix(base64String: string): string {
  // Define the regular expression pattern to match either "data:image/png;base64," or "data:image/jpeg;base64,"
  const regex = /^(data:image\/(?:png|jpeg);base64,)/;
  // Use RegExp.replace() to remove the matched prefix from the base64 string
  return base64String.replace(regex, '');
}

async function getBase64image(image: Jimp): Promise<string> {
  return new Promise((resolve, reject) => {
    image.getBase64(Jimp.MIME_JPEG, (err, res) => {
      if (err) return reject(err instanceof Error ? err : new Error(String(err)));
      resolve(res.split(',')[1]);
    });
  });
}

function wrapText(text: string, maxWidth: number, font: Font) {
  let wrappedText = '';
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const testSize = Jimp.measureText(font, testLine);

    if (testSize <= maxWidth || currentLine === '') {
      currentLine = testLine;
    } else {
      wrappedText += (wrappedText ? '\n' : '') + currentLine;
      currentLine = char;
    }
  }

  wrappedText += (wrappedText ? '\n' : '') + currentLine;
  return wrappedText;
}

export default async function generate(data: LicenseImageTemplate) {
  // dl template size 1011 x 638
  const templateSize = {
    width: 1011,
    height: 638,
  };

  // address max width
  // max width for the address text
  const adressMaxWidth = 400;
  // get the driving license image template
  const image = await Jimp.read(data.imageTemplate);

  //  Load the fonts
  const stateName = await Jimp.loadFont(HindFont.stateName);
  const document = await Jimp.loadFont(HindFont.document);
  const topSignatory = await Jimp.loadFont(HindFont.topSignatory);
  const sideSignatory = await Jimp.loadFont(HindFont.sideSignatory);
  const label = await Jimp.loadFont(HindFont.label);

  // once the image is loaded, we can start drawing on it
  if (image) {
    image.resize(templateSize.width, templateSize.height);
    const height = image.getHeight();
    const width = image.getWidth();

    // hight positioning
    const horizontalStartPosition = height / 2;
    // width positioning
    const verticalStartPosition = width / 2;

    // get the passport photo main view
    const passportPhotoMain = await Jimp.read(data.passportPhoto);
    passportPhotoMain.resize(Jimp.AUTO, 300);

    // get the passport photo faded view
    const passportPhotoFaded = await Jimp.read(data.passportPhoto2);
    passportPhotoFaded.resize(Jimp.AUTO, 150);

    // get the top signatory IMAGE DATA
    const topSignatoryValue = await Jimp.read(data.topSignature);
    // get the side signatory IMAGE DATA
    const sideSignatoryValue = await Jimp.read(data.sideSignature);
    // get the bottol signatory IMAGE DATA
    const bottomSignature = await Jimp.read(data.bottomSignature);

    // get the state logo
    const stateLogo = await Jimp.read(data.stateLogo);

    // get the frsc logo
    const frscLogo = await Jimp.read(data.frscLogo);

    // write the state name
    image.print(
      stateName,
      verticalStartPosition - 455,
      horizontalStartPosition - 300,
      data.stateName?.toUpperCase(),
    );

    // write the state name
    image.print(
      document,
      verticalStartPosition - 455,
      horizontalStartPosition - 250,
      data.document?.toUpperCase(),
    );

    // write the document type
    image.print(
      document,
      verticalStartPosition - 455,
      horizontalStartPosition - 250,
      data.document?.toUpperCase(),
    );

    // write the top signatory label
    image.print(
      topSignatory,
      verticalStartPosition - 455,
      horizontalStartPosition - 170,
      data.topSignatory,
    );
    // write the top signatory value
    topSignatoryValue.resize(70, Jimp.AUTO);
    image.blit(topSignatoryValue, verticalStartPosition - 325, horizontalStartPosition - 185);

    // Create a blank image to draw side signatory this will allow us to rotate the text
    // and write it on the main image
    const sideTextImage = new Jimp(500, 500, 0x00000000);
    sideTextImage.print(sideSignatory, 0, 0, data.sideSignatory);
    sideTextImage.rotate(90, false);

    // write the side signatory label
    image.blit(sideTextImage, verticalStartPosition - 490, horizontalStartPosition - 340);
    // write the side signatory value
    sideSignatoryValue.resize(70, Jimp.AUTO);
    sideSignatoryValue.rotate(90, false);
    image.blit(sideSignatoryValue, verticalStartPosition - 510, horizontalStartPosition - 75);

    // write the bottom signatory value
    bottomSignature.resize(200, Jimp.AUTO);
    image.blit(bottomSignature, verticalStartPosition - 440, horizontalStartPosition + 190);

    // draw the FRSC logo
    frscLogo.resize(300, Jimp.AUTO);
    image.blit(frscLogo, verticalStartPosition - 25, horizontalStartPosition - 326);

    // draw the FRSC logo
    stateLogo.resize(130, Jimp.AUTO);
    image.blit(stateLogo, verticalStartPosition + 360, horizontalStartPosition - 326);

    // write the LGA abbreviation
    image.print(
      topSignatory,
      verticalStartPosition + 310,
      horizontalStartPosition - 270,
      data.lgaAbbreviation?.toUpperCase(),
    );

    // write the header text
    image.print(
      stateName,
      verticalStartPosition - 140,
      horizontalStartPosition - 230,
      data.header?.toUpperCase(),
    );

    // the main data section starts here:::::::::::::::::::::::::::::::::::::::::::
    // write the dl number
    image.print(label, verticalStartPosition - 200, horizontalStartPosition - 150, '4D');
    image.print(
      label,
      verticalStartPosition - 150,
      horizontalStartPosition - 150,
      data.dlLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x, y - 40, data.dlValue?.toUpperCase());
      },
    );

    // write date of birth (DOB)
    image.print(
      label,
      verticalStartPosition + 160,
      horizontalStartPosition - 150,
      data.dobLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x, y - 40, data.dobValue?.toUpperCase());
      },
    );

    // write the dl number
    image.print(label, verticalStartPosition + 110, horizontalStartPosition - 110, '4B');
    image.print(
      label,
      verticalStartPosition + 160,
      horizontalStartPosition - 110,
      data.expLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x, y - 40, data.expValue?.toUpperCase());
      },
    );

    // write the class text
    image.print(label, verticalStartPosition - 190, horizontalStartPosition - 110, '9');
    image.print(
      label,
      verticalStartPosition - 150,
      horizontalStartPosition - 110,
      data.class?.toUpperCase(),
    );

    // first name
    image.print(label, verticalStartPosition - 190, horizontalStartPosition - 70, '2');
    image.print(
      topSignatory,
      verticalStartPosition - 150,
      horizontalStartPosition - 70,
      data.LastName?.toUpperCase(),
    );

    // write last name
    image.print(label, verticalStartPosition - 187, horizontalStartPosition - 30, '1');
    image.print(
      topSignatory,
      verticalStartPosition - 150,
      horizontalStartPosition - 30,
      data.firstName?.toUpperCase(),
    );

    // write address
    image.print(label, verticalStartPosition - 187, horizontalStartPosition + 10, '8');
    image.print(
      topSignatory,
      verticalStartPosition - 150,
      horizontalStartPosition + 10,
      {
        text: wrapText(data.address?.toUpperCase(), adressMaxWidth, topSignatory),
      },
      adressMaxWidth,
      Jimp.AUTO,
    );
    image.print(
      topSignatory,
      verticalStartPosition - 150,
      horizontalStartPosition + 80,
      data.location?.toUpperCase(),
    );
    image.print(
      topSignatory,
      verticalStartPosition - 150,
      horizontalStartPosition + 110,
      data.state?.toUpperCase(),
    );

    // write issue date
    image.print(label, verticalStartPosition - 200, horizontalStartPosition + 160, '4A');
    image.print(
      label,
      verticalStartPosition - 150,
      horizontalStartPosition + 160,
      data.issueLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x, y - 40, data.issueValue?.toUpperCase());
      },
    );

    // write  sex text
    image.print(label, verticalStartPosition - 196, horizontalStartPosition + 223, '15');
    image.print(
      label,
      verticalStartPosition - 150,
      horizontalStartPosition + 223,
      data.sexLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x + 5, y - 40, data.sexValue?.toUpperCase());
      },
    );

    // write height text
    image.print(label, verticalStartPosition - 196, horizontalStartPosition + 260, '16');
    image.print(
      label,
      verticalStartPosition - 150,
      horizontalStartPosition + 260,
      data.heightLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x, y - 40, data.heightValue?.toUpperCase());
      },
    );

    // write eye text
    image.print(label, verticalStartPosition + 90, horizontalStartPosition + 223, '17');
    image.print(
      label,
      verticalStartPosition + 130,
      horizontalStartPosition + 223,
      data.eyeLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x + 5, y - 40, data.eyeValue?.toUpperCase());
      },
    );
    // write eye text
    image.print(label, verticalStartPosition + 90, horizontalStartPosition + 260, '18');
    image.print(
      label,
      verticalStartPosition + 130,
      horizontalStartPosition + 260,
      data.weightLabel?.toUpperCase(),
      (err, image, { x, y }) => {
        image.print(topSignatory, x + 5, y - 40, data.weightValue?.toUpperCase());
      },
    );

    // the main data section ends here:::::::::::::::::::::::::::::::::::::::::::

    // draw the main passport photo
    // crop the passport photo to fit the template
    // passport photo size 413 x 531 EU, Nigeria, UK, etc.
    // passport photo size 600 x 600 U.S. Passport, general use
    const cropWidth = 413;
    const cropHeight = 531;

    const { width: passportPhotoWidth, height: passportPhotoHight } = passportPhotoMain.bitmap;

    const finalCropWidth = Math.min(cropWidth, passportPhotoWidth);
    const finalCropHeight = Math.min(cropHeight, passportPhotoHight);

    let x = Math.floor((passportPhotoWidth - finalCropWidth) / 2);
    let y = Math.floor((passportPhotoHight - finalCropHeight) / 2);

    // Clamp x and y to prevent overflow on crop
    x = Math.max(0, Math.min(x, passportPhotoWidth - finalCropWidth));
    y = Math.max(0, Math.min(y, passportPhotoHight - finalCropHeight));

    passportPhotoMain.crop(x, y, finalCropWidth, finalCropHeight);

    image.blit(passportPhotoMain, verticalStartPosition / 10, horizontalStartPosition - 115);

    // draw the bottom passport photo
    image.composite(
      passportPhotoFaded,
      verticalStartPosition + 360,
      horizontalStartPosition + 155,
      {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.9,
        opacityDest: 0.6,
      },
    );
    return await getBase64image(image);
  }
  return null;
}
