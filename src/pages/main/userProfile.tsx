import React, { FC, useMemo } from 'react';

import {
  Button,
  chakra,
  Flex as ChakraFlex,
  Divider,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text
} from '@chakra-ui/react';
import { capitalize } from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { db, auth as firebaseAuth } from 'lib/firebase/firebaseInit';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import { withMask } from "use-mask-input"

import { DifficultLevel, difficultTestTypeRelation, UserDetails } from 'types';

import { useAuthContext, useFirebaseContext } from 'lib/firebase';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { ImageUpload } from 'components/common';
import { collection, doc, updateDoc } from 'firebase/firestore';

type AllowedUpdateFields = Omit<UserDetails, 'activity' | 'admin' | 'hasAlreadyPayed'> & {
  currentPassword?: string;
  newPassword?: string;
};

interface UserProfilePageProps { }

export const UserProfilePage: FC<UserProfilePageProps> = () => {
  const { firestore, auth } = useFirebaseContext();
  const { user, refetchUserDetails } = useAuthContext();

  const { register, watch, handleSubmit, getValues, control, setValue } = useForm<AllowedUpdateFields>({
    defaultValues: user?.userDetails
  });

  const difficultLevel = watch('difficultLevel') as DifficultLevel;

  const testTypes = useMemo(() => {
    return difficultTestTypeRelation[difficultLevel] ?? [];
  }, [difficultLevel]);

  const { mutate: updateUserMutation, isLoading } = useMutation(async () => {
    const updateValues: AllowedUpdateFields = getValues();

    try {
      const userRef = doc(db, 'users', user?.uid);
      await updateDoc(userRef, { ...updateValues, picture: updateValues.picture ? updateValues.picture : null });

      if (updateValues.currentPassword && updateValues.newPassword) {
        const credential = firebaseAuth.EmailAuthProvider.credential(
          auth.currentUser.email,
          updateValues.currentPassword
        );

        await auth.currentUser.reauthenticateWithCredential(credential);
        await auth.currentUser.updatePassword(updateValues.newPassword);

        setValue('currentPassword', updateValues.newPassword);
      }

      refetchUserDetails();

      toast.success('Your profile has been updated');
    } catch (error) {
      toast.error('An error has occurred, try  again!');
    }
  });

  const onSubmit = () => {
    updateUserMutation();
  };

  const cleverUserId = user?.userDetails?.cleverUserId;
  const isCleverUser = Boolean(cleverUserId);

  return (
    <BasePage spacing="md">
      <BasePageTitle title="Profile" paddingBottom="md" />
      <chakra.form
        display="flex"
        alignItems="center"
        flexDirection="column"
        margin="auto"
        onSubmit={handleSubmit(onSubmit)}
        width={{
          lg: '100%',
          xl: '80%'
        }}
      >
        <ChakraFlex width="100%" alignItems="center" flexDirection="column">
          <ChakraFlex width="100%" alignItems="center" my={4}>
            <Text color="blue.500" fontSize="xl" fontWeight="bold" marginRight="md" whiteSpace="nowrap">
              Personal data
            </Text>
            <Divider borderColor="teal.500" />
          </ChakraFlex>
          <SimpleGrid width="100%" columns={isCleverUser ? 1 : 2} gap="md">
            {!isCleverUser && (
              <ChakraFlex flexDirection="column">
                <FormLabel>Profile picture</FormLabel>
                <Controller
                  name="picture"
                  control={control}
                  disabled={isLoading}
                  render={({ field: { value, onChange } }) => (
                    <ImageUpload
                      height="328px"
                      value={value}
                      imageName={user?.uid?.toString()}
                      onChange={(imageUrl) => onChange(imageUrl)}
                    />
                  )}
                />
              </ChakraFlex>
            )}
            {isCleverUser ? (
              <ChakraFlex flexDirection="column">
                <FormLabel>Clever User ID</FormLabel>
                <Input disabled value={cleverUserId ?? ''} isReadOnly borderColor="gray.500" />
              </ChakraFlex>
            ) : (
              <SimpleGrid gap="md">
                <ChakraFlex width="100%" alignItems="center">
                  <ChakraFlex width="100%" flexDirection="column" marginRight="sm">
                    <FormLabel>First name</FormLabel>
                    <Input type="firstName" name="firstName" {...register("firstName")} disabled={isLoading} borderColor="gray.500" />
                  </ChakraFlex>
                  <ChakraFlex width="100%" flexDirection="column" marginLeft="sm">
                    <FormLabel>Last name</FormLabel>
                    <Input type="lastName" name="lastName" {...register("lastName")} disabled={isLoading} borderColor="gray.500" />
                  </ChakraFlex>
                </ChakraFlex>
                <ChakraFlex width="100%" flexDirection="column">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" {...register("email")} disabled borderColor="gray.500" />
                </ChakraFlex>
                <ChakraFlex width="100%" flexDirection="column">
                  <FormLabel>Phone</FormLabel>
                  <Input
                    required
                    name="phone"
                    height="40px"
                    paddingX="md"
                    border="sm"
                    borderRadius="md"
                    borderColor="gray.500"
                    transitionDuration="0.3s"
                    _focus={{
                      outlineColor: 'blue.500'
                    }}
                    disabled={isLoading}
                    ref={withMask("9999999999999")}
                    {...register("phone")}
                    style={{ border: "1px solid #999" }}
                  />
                </ChakraFlex>
                <ChakraFlex width="100%">
                  <ChakraFlex width="100%" flexDirection="column" marginRight="sm">
                    <FormLabel>Current password</FormLabel>
                    <Input type="password" name="currentPassword" {...register("currentPassword")} />
                  </ChakraFlex>
                  <ChakraFlex width="100%" flexDirection="column" marginLeft="sm">
                    <FormLabel>New password</FormLabel>
                    <Input type="password" name="newPassword" {...register("newPassword")} />
                  </ChakraFlex>
                </ChakraFlex>
              </SimpleGrid>
            )}
          </SimpleGrid>
        </ChakraFlex>
        {!isCleverUser && (
          <>
            <ChakraFlex width="100%" alignItems="center" flexDirection="column">
              <ChakraFlex width="100%" alignItems="center" mt={6} mb={4}>
                <Text color="blue.500" fontSize="xl" fontWeight="bold" marginRight="md" whiteSpace="nowrap">
                  Account Data
                </Text>
                <Divider borderColor="teal.500" />
              </ChakraFlex>
              <SimpleGrid width="100%" columns={2} gap="md">
                <ChakraFlex flexDirection="column">
                  <FormLabel>School/Business Example</FormLabel>
                  <Input disabled name="schoolName" borderColor="gray.500" {...register("schoolName")} />
                </ChakraFlex>
                <ChakraFlex flexDirection="column">
                  <FormLabel>Exam date</FormLabel>
                  <Input disabled type="date" name="examDate" borderColor="gray.500" {...register("examDate")} />
                </ChakraFlex>
                <ChakraFlex width="100%" flexDirection="column">
                  <FormLabel>Difficult level</FormLabel>
                  <Select type="difficultLevel" name="difficultLevel" {...register("difficultLevel")} isDisabled={true} defaultValue="">
                    <option value="" disabled>
                      Not selected
                    </option>
                    {Object.keys(difficultTestTypeRelation).map((difficultLevel) => (
                      <option key={difficultLevel} value={difficultLevel}>
                        {difficultLevel}
                      </option>
                    ))}
                  </Select>
                </ChakraFlex>
                <ChakraFlex width="100%" flexDirection="column">
                  <FormLabel>Test type</FormLabel>
                  <Select name="testType" {...register("testType")} isDisabled={true} defaultValue="">
                    <option value="" disabled>
                      Not selected
                    </option>
                    {testTypes.map((testType) => (
                      <option key={testType} value={testType}>
                        {capitalize(testType.replace(/[-|_]/gi, ' '))}
                      </option>
                    ))}
                  </Select>
                </ChakraFlex>
              </SimpleGrid>
            </ChakraFlex>
            <ChakraFlex width="100%" justifyContent="flex-end" mt={8}>
              <Button colorScheme="green" type="submit" borderRadius="sm" disabled={isLoading} shadow="md">
                Save changes
              </Button>
            </ChakraFlex>
          </>
        )}
      </chakra.form>
    </BasePage>
  );
};
