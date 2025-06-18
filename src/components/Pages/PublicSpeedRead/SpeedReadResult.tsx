import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Text as ChakraText,
  Divider as ChakraDivider,
  Image as ChakraImage
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { Lead } from 'types';
import { Icon } from 'components/common';
import { ImageGallery } from 'components/common';

const galleryImages = [
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FImage%20for%20Store%20Mindflow%20small.jpg?alt=media&token=99ad2f45-2a1b-4b25-bb18-f1782bfe905e',
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2Fdiagnostic%20test%20mocku.png?alt=media&token=565c377b-f170-47cd-890c-906e4098af29',
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FMost%20complete%20Speed%20Reading%20Tool%20-%20MindFlowpnmg.png?alt=media&token=e45bcd9c-cb92-48ff-bb83-3511a6451937'
];

export interface SpeedReadResultProps {
  lead: Lead | null;
}

export const SpeedReadResult: FC<SpeedReadResultProps> = ({ lead }) => {
  const navigate = useNavigate();

  const wordSpeed = lead?.result?.wordSpeed;
  const americanSpeedAverage = 238;
  const wordSpeedPercentage = Math.round((americanSpeedAverage - wordSpeed) / americanSpeedAverage * 100);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
        Results!
      </ChakraHeading>
      <ChakraText marginBottom="lg" color="gray.600" fontWeight="bold">
        Congratulations{' '}
        <ChakraText color="blue.500" as="span">
          {lead?.name}
        </ChakraText>
        , check your reading speed result below:
      </ChakraText>

      <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }} alignItems="center" marginBottom="xl">
        <ChakraFlex flex={{ lg: "3", sm: "1" }} flexDirection="column" >
          <ChakraText marginBottom="xs">Speed read result:</ChakraText>
          <ChakraHeading
            fontSize="3rem"
            fontWeight="300"
            mt="sm"
            color="#73D873"
          >
            {lead?.result?.wordSpeed}
          </ChakraHeading>
        </ChakraFlex>
        <ChakraFlex flex="1" flexDirection={{ xs: 'row', lg: 'column' }}>
          <ChakraText marginBottom="xs"></ChakraText>
          <ChakraFlex
            mt="sm"
            flexDirection={{ xs: 'column', lg: 'row' }}
            alignItems={{ xs: 'center', lg: 'baseline' }}
          >
            <Icon
              name="speed_reading_score"
              color="teal.500"
              marginRight="20px"
              boxSize="5.5rem"
              marginLeft={{ sm: "-120px", lg: "0px" }}
              marginTop={{ sm: "sm" }}
            />
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex flex="2" flexDirection={{ xs: 'column', lg: 'row' }}>
          <ChakraText marginBottom="xs"></ChakraText>
          <ChakraFlex
            mt="sm"
            flexDirection={{ xs: 'column', lg: 'row' }}
            alignItems={{ xs: 'center', lg: 'baseline' }}
          >
            Your speed reading score is {wordSpeedPercentage > 0 ? Math.abs(wordSpeedPercentage) + '% above' : Math.abs(wordSpeedPercentage) + '% bellow'} the average American speed.

          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>

      <ChakraHeading width="100%" fontSize="md" textAlign="left" marginBottom="md" textStyle="title-with-border-bottom">
        Improve your Score with Mindflow!
      </ChakraHeading>
      <ChakraText marginBottom="xl" fontWeight="bold" color="gray.600">
        Continue your journey with{' '}
        <ChakraText as="span" color="blue.500">
          MindFlow
        </ChakraText>{' '}
        to develop your skills and improve your reading speed, comprehension and test scores.
      </ChakraText>
      <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }} marginBottom="xl">
        <ChakraButton
          colorScheme="green"
          marginBottom={{ xs: 'md', lg: 'none' }}
          marginRight={{ xs: 'none', lg: 'xl' }}
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
          onClick={() => window.open('https://mindflowspeedreading.com/', '_blank')}
        >
          Mindflow Website
        </ChakraButton>
        <ChakraButton
          colorScheme="blue"
          onClick={() => push('/free/program')}
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
        >
          Buy Full Program
        </ChakraButton>
      </ChakraFlex>

      <ChakraHeading marginBottom="md">What is MindFlow</ChakraHeading>
      <iframe
        width="100%"
        height="500"
        frameBorder="0"
        allowFullScreen
        title="What is MindFlow"
        src="https://www.youtube.com/embed/t-O4bxfydxQ"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      <ChakraDivider marginY="lg" borderColor="gray.400" mt="xxl" />

      <ChakraHeading width="100%" fontSize="xxl" textAlign="center" marginBottom="md">
        MindFlow’s Free Speed Reading Test
      </ChakraHeading>

      <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }} alignItems="center" marginBottom="xl" marginTop="xl">
        <ChakraFlex flex={{ lg: '2', xs: '1' }} flexDirection="column">
          <ChakraImage
            width="100%"
            objectFit="cover"
            borderRadius="sm"
            src="https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FMindflow%20Tag%201.png?alt=media&token=6633a061-665e-4999-911c-2cbf4dc00ee7"
          />
        </ChakraFlex>
        <ChakraFlex flex={{ lg: '3', xs: '1' }} flexDirection="column" marginLeft={{ lg: "xxl", sm: "0" }} marginTop={{ xs: "xxl", lg: "0" }}>
          <ChakraText width="100%" fontSize="xxl" textAlign="left" fontWeight="bold" marginBottom="md">
            MindFlow’s Free Speed Reading Program
          </ChakraText>
          <ChakraText color="blue.500" fontWeight="bold" marginBottom="sm">
            Price:{' '}
            <ChakraText fontWeight="normal" as="span">
              $147
            </ChakraText>
          </ChakraText>
          <ChakraText color="blue.500" fontWeight="bold" marginBottom="sm">
            Category:{' '}
            <ChakraText fontWeight="normal" as="span">
              Software
            </ChakraText>
          </ChakraText>
          <ChakraButton
            colorScheme="blue"
            marginRight={{ xs: 'none', lg: 'xl' }}
            marginBottom={{ xs: 'md', lg: 'none' }}
            width={{ xs: '100%', lg: '150px' }}
            onClick={() => push('/free/program')}
            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
          >
            Buy Now
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>

      <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }} alignItems="center" marginTop="xxl">
        <ChakraText fontSize="md">
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
          totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora
          incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
          Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
          vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
          <br /><br />
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
          totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
          ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut
          labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem
          ullam corporis suscipit
        </ChakraText>
      </ChakraFlex>
      <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }} alignItems="center" marginBottom="xl" marginTop="xl">
        <ChakraButton
          colorScheme="white"
          color="#05314A"
          marginRight={{ xs: 'none', lg: 'xl' }}
          marginBottom={{ xs: 'md', lg: 'none' }}
          width={{ xs: '100%', lg: '150px' }}
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
          onClick={() => window.open('https://mindflowspeedreading.com/', '_blank')}
        >
          MindFlow Website
        </ChakraButton>

        <ChakraButton
          colorScheme="blue"
          onClick={() => navigate('/free/program')}
          marginRight={{ xs: 'none', lg: 'xl' }}
          marginBottom={{ xs: 'md', lg: 'none' }}
          width={{ xs: '100%', lg: '150px' }}
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
        >
          Buy Now
        </ChakraButton>
      </ChakraFlex>

      {galleryImages && (
        <ChakraFlex
          minHeight="60vh"
          marginTop="xxl"
          marginBottom="xl">
          <ImageGallery images={galleryImages} />
        </ChakraFlex>
      )}

    </ChakraFlex>
  );
};
