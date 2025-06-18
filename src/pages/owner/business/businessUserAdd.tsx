import React, { FC } from 'react';

import { useFirebaseContext } from 'lib/firebase';

import {
  chakra,
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Heading as ChakraHeading,
  Input as ChakraInput,
  Select as ChakraSelect,
  SimpleGrid as ChakraSimpleGrid,
  Spinner as ChakraSpinner,
  Text as ChakraText
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import {
  DifficultLevel,
  difficultTestTypeRelation,
  ELicenseStatus,
  ELicenseType,
  TestType,
  UserDetails,
  WhereDidYouHearAboutUs,
  whereDidYouHearAboutUsOptions
} from 'types';

import {
  currentLevelsOptions,
  userTypeOptions,
  currentLevelTestTypes,
  SelectedUserFields,
  SubmitValues,
  userSubmitSchema
} from './index';

import { Icon } from 'components/common';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import axios from 'axios';
import { withMask } from 'use-mask-input';


const WHERE_DID_YOU_HEAR_ABOUT_US_DESCRIPTIVE_OPTIONS: WhereDidYouHearAboutUs[] = [
  'consultant',
  'former',
  'test_prep_company',
  'dominate_prep',
  'tutor',
  'online_course',
  'school',
  'teacher',
  'club',
  'other'
];

interface SubmittedValues {
  user: SelectedUserFields;
  password: string;
}

interface ActivateLicenseFormProps {
  isLoading: boolean;
  defaultValues?: SubmittedValues;
  onSubmit: (values: SubmittedValues) => void;
}

export const AddBusinessUserForm: FC<any> = ({ isLoading, onSubmit, businessData }) => {
  const {
    handleSubmit,
    register,
    watch,
    control,
    formState: { isValid }
  } = useForm<
    SelectedUserFields & {
      password: string;
    }
  >({
    defaultValues: {
      whereDidYouHearAboutUs: 'other',
      currentLevel: 'college',
      testType: 'gmat'
    }
  });
  const { firestore } = useFirebaseContext();
  const formValues = watch();

  const testTypes = currentLevelTestTypes[formValues.currentLevel as DifficultLevel] ?? [];

  const getValidatedTestType = (level: DifficultLevel, testType: TestType | 'no_test'): TestType => {
    if (['esl', 'toefl'].includes(testType)) return 'sat';

    if (testType === 'no_test') {
      const testTypeByLevel: Record<string, TestType> = {
        high_school: 'sat',
        college: 'gmat',
        adult: 'gmat'
      };

      return testTypeByLevel[level] || 'ssat';
    }

    return testType;
  };

  const handleFormSubmit = (fields: SubmitValues) => {
    const result = userSubmitSchema.validate(fields, { abortEarly: true });

    if (result.error) {
      return toast.error(result.error.message);
    }

    const values = result.value as SubmitValues;
    const password = values.password;

    delete values.password;

    const existingLevel = Object.keys(difficultTestTypeRelation).includes(values.currentLevel);

    // @ts-ignore
    values.difficultLevel = existingLevel ? values.currentLevel : 'adult';

    const submittedValues: SubmittedValues = {
      password,
      user: {
        ...values,
        testType: getValidatedTestType(values.difficultLevel, values.testType)
      }
    };

    console.log(submittedValues, 'submitted valssss');

    onSubmit(submittedValues);

    addBusinessUser();
  };

  const { mutate: addBusinessUser } = useMutation(async () => {
    try {
      console.log(formValues, 'before license create');

      const durationDays = 90;

      await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createBusinessUser`, {
        user: {
          email: formValues.email,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          license: formValues.license,
          businessId: formValues.businessId,
          difficultLevel: 'adult',
          testType: 'sat'
        },
        password: formValues.password
      });

      toast.success('License created');
    } catch (error) {
      console.error(error);
      toast.error('An error has occurred, try  again!');
    }
  });

  return (
    <ChakraFlex flexDirection="column">
      {isLoading ? (
        <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
          <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
        </ChakraFlex>
      ) : (
        <chakra.form onSubmit={handleSubmit(handleFormSubmit)}>
          <ChakraFlex flexDirection="column" py={10} px={10}>
            <ChakraSimpleGrid columns={2} marginBottom="md" gap="md">
              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>Business</ChakraFormLabel>
                <ChakraSelect
                  required
                  type="businessId"
                  borderColor="gray.500"
                  name="businessId"
                  defaultValue="college"
                  {...register("businessId")}
                >
                  {businessData.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </ChakraSelect>
              </ChakraFlex>
              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>User type</ChakraFormLabel>
                <ChakraSelect
                  required
                  type="license"
                  borderColor="gray.500"
                  name="license"
                  defaultValue=""
                  {...register("license")}
                >
                  {Object.entries(userTypeOptions).map(([level, label]) => (
                    <option key={level} value={level}>
                      {label}
                    </option>
                  ))}
                </ChakraSelect>
              </ChakraFlex>
              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>Email</ChakraFormLabel>
                <ChakraInput required type="email" name="email" {...register("email")} borderColor="gray.500" />
              </ChakraFlex>

              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>Password</ChakraFormLabel>
                <ChakraInput required type="password" name="password" {...register("password")} borderColor="gray.500" />
              </ChakraFlex>

              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>First name</ChakraFormLabel>
                <ChakraInput required type="firstName" name="firstName" {...register("firstName")} borderColor="gray.500" />
              </ChakraFlex>

              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>Last name</ChakraFormLabel>
                <ChakraInput required type="lastName" name="lastName" {...register("lastName")} borderColor="gray.500" />
              </ChakraFlex>

              <ChakraFlex flexDirection="column">
                <ChakraFormLabel>Phone</ChakraFormLabel>
                <ChakraInput
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
            </ChakraSimpleGrid>
          </ChakraFlex>

          <ChakraFlex
            py={4}
            px={10}
            borderTop="sm"
            borderColor="gray.300"
            borderBottomRadius="lg"
            bgColor="gray.100"
            justifyContent="flex-end"
            alignItems="center"
          >
            <ChakraButton variant="solid" colorScheme="blue" type="submit" isDisabled={!isValid}>
              Add user
            </ChakraButton>
          </ChakraFlex>
        </chakra.form>
      )}
    </ChakraFlex>
  );
};
