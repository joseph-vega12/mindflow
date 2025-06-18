import React, { FC } from 'react';
import { Box, BoxProps, Divider, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { Icon } from 'components/common';

interface Props extends BoxProps {
  title: string;
  showGoBack?: boolean;
  redirectRoute?: string;
  started?: boolean;
}

export const BasePageTitle: FC<Props> = ({ children, title, redirectRoute, showGoBack, started, ...rest }) => {

  const navigate = useNavigate();

  const handleGoBack = () => {
    if (redirectRoute) {
      return navigate(redirectRoute);
    }

    navigate(-1);
  };
  return (
    <Box mb={5}>
      <Box display="flex" alignItems="center">
        {title === 'Speed Assessment' && !started && (
          <Icon name="circle_go_back" cursor="pointer" onClick={handleGoBack} color="gray.500" size="20px" mr={2} />
        )}
        {title === 'Diagnostic Test' && !started && (
          <Icon name="circle_go_back" cursor="pointer" onClick={handleGoBack} color="gray.500" size="20px" mr={2} />
        )}
        <Box {...rest}>
          <Heading as="h2" px={0} fontSize="2xl" fontWeight="600" color="blue.500">
            {title}
          </Heading>
          {children}
        </Box>
        {title === 'Practice Exercises' && !started && (
          <Box bg="teal.500" w="64%" p="10px" ms="100px" mb="20px" fontWeight="500">
            To learn how to do the different exercises, watch the INSTRUCTIONAL videos under the Speed Reading tab in
            the Training section. For walk-throughs, watch DEMONSTRATION videos.
          </Box>
        )}
        {title === 'Training Videos' && !started && (
          <Box bg="teal.500" w="64%" p="5px" ms="200px" mb="20px" fontWeight="500">
            Both video types are important to improve your reading performance, making it more efficient and effective.
            Watch the training videos to learn the reading skills and the mindset videos to perform and feel better.
          </Box>
        )}

        {title === 'Library' && !started && (
          <Box bg="teal.500" w="63%" p="10px" mb="10px" fontWeight="500">
            To learn how to do the different exercises, watch the INSTRUCTIONAL videos under the Speed Reading tab in
            the Training section. For walk-throughs, watch DEMONSTRATION videos.
          </Box>
        )}
      </Box>
      <Divider borderColor="gray.400" />
    </Box>
  );
};
