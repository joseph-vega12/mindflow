import { Box, Image } from '@chakra-ui/react';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import React from 'react';

import { Icon } from 'components/common';
import noProfileImage from 'assets/images/noProfileImage.png';

interface Props {
  photoUrl?: string;
  onFileRead: (file: File | null) => void;
}

export const PhotoPreview: FC<Props> = ({ photoUrl = noProfileImage, onFileRead }) => {
  const [previewFile, setPreviewFile] = useState(photoUrl || noProfileImage);
  const inputEl = useRef(null);

  useEffect(() => {
    console.log('remounted');
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event);
    if (!event?.target?.files?.length) return onFileRead(null);

    const [selectedFile] = event?.target?.files;

    const reader = new FileReader();

    reader.onloadend = () => {
      // @ts-ignore
      setPreviewFile(reader?.result ?? '');
      return onFileRead(selectedFile);
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    } else {
      onFileRead(null);
    }
  };

  return (
    // @ts-ignore
    <Box onClick={() => inputEl?.current.click()} d="flex" justifyContent="center" mb={10}>
      <Box position="relative">
        <Image src={previewFile} alt="" size="170px" rounded="full" />
        <Box display="none">
          <input accept="image/*" ref={inputEl} type="file" onInput={handleImageUpload} />
        </Box>
        <Box
          backgroundColor="gray.500"
          position="absolute"
          bottom={0}
          right={1}
          rounded="full"
          p={2}
        >
          <Icon fontSize="3xl" color="white" name="create" />
        </Box>
      </Box>
    </Box>
  );
};
