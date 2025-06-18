import React, { FC, useEffect, useMemo, useState } from 'react';

import { get } from 'lodash';
import Joi from 'joi';

import {
  Button as ChakraButton,
  Checkbox as ChakraCheckbox,
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Heading as ChakraHeading,
  Input as ChakraInput,
  Select as ChakraSelect,
  SimpleGrid as ChakraSimpleGrid,
  Text as ChakraText,
  useBoolean
} from '@chakra-ui/react';
import { GoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { Icon, ImageGallery, PageLoading, Timer } from 'components/common';
import {
  SpeedReadConfiguration,
  SpeedReadResult,
  SpeedReadTest,
  TextConfiguration
} from 'components/Pages/PublicSpeedRead';

import {
  DifficultLevel,
  difficultTestTypeRelation,
  EssayDocumentWithId,
  Lead,
  userFriendlyDifficultLevel,
  WhereDidYouHearAboutUs,
  whereDidYouHearAboutUsOptions
} from 'types';
import { LeadDocumentWithId } from 'types/firestoreDb/Lead';
import { useCountdown, useTimer } from 'lib/customHooks';
import { Footer } from 'components/Pages/PublicSpeedRead';

const leadSchema = Joi.object({
  name: Joi.string().min(2).required(),
  programPreparation: Joi.boolean(),
  programEducationLevel: Joi.string().allow(''),
  programTestType: Joi.string().allow(''),
  programTestDate: Joi.string().allow(''),
  whereDidYouHearAboutUs: Joi.string().allow(''),
  whereDidYouHearAboutUsObservation: Joi.string().allow(null),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(10)
    .max(30)
    .required()
}).required();

const WHERE_DID_YOU_HEAR_ABOUT_US_DESCRIPTIVE_OPTIONS: WhereDidYouHearAboutUs[] = [
  'consultant',
  'former',
  'test_prep_company',
  'tutor',
  'online_course',
  'school',
  'teacher',
  'club',
  'other'
];

export const PublicSpeedReadHome: FC = () => {
  const [hasStarted, setHasStarted] = useBoolean(false);
  const [hasFinished, setHasFinished] = useBoolean(false);
  const [mobileStep, setMobileStep] = useState<number | undefined>(undefined);
  const [createdLead, setCreatedLead] = useState<LeadDocumentWithId | null>(null);

  const [reCaptchaVerificationToken, setReCaptchaVerificationToken] = useState('');
    const [lead, setLead] = useState({
    name: '',
    email: '',
    programPreparation: false,
    // programPreparation: true,
    programEducationLevel: '',
    programTestType: '',
    programTestDate: '',
    whereDidYouHearAboutUs: 'other',
    whereDidYouHearAboutUsObservation: null
  });

  const [textConfiguration, setTextConfiguration] = useState<TextConfiguration>({
    category: 'adult',
    fontSize: 18,
    fontFamily: 'Roboto'
  });

  const canStartTest = useMemo(() => {
    if (reCaptchaVerificationToken) {
      if (lead.programPreparation) {
        return !!(
          lead.email &&
          lead.name &&
          lead.programEducationLevel &&
          lead.programTestDate &&
          lead.programTestType
        );
      } else {
        return !!(lead.email && lead.name);
      }
    }

    return false;
  }, [lead]);

  const { error: invalidLead } = useMemo(() => leadSchema.validate(lead, {}), [lead]);

  const freeEssaysQuery = useQuery(
    ['publicSpeedRead', 'essays'],
    async () => {
      const freeEssays = await axios.get(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/listFreeSpeedTests`);

      return freeEssays.data.result as Record<DifficultLevel, EssayDocumentWithId>;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );
  const selectedEssay = useMemo(() => get(freeEssaysQuery, ['data', textConfiguration.category]), [
    freeEssaysQuery.data,
    textConfiguration.category
  ]);

  const { mutate: createLead, isLoading: isCreating } = useMutation<any>(
    ['createBetaUser'],
    async () =>
      axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createLead`, {
        category: textConfiguration.category,
        ...lead
      }),
    {
      onSuccess({ data }) {
        const { lead } = data;

        setCreatedLead(lead);

        if (!lead) throw new Error('Lead not found');
        if (!lead.result) {
          setHasStarted.on();
          startCountdown();
        } else {
          toast.info('This email has already been used, here is your previous result');
          setHasFinished.on();
        }
      },
      onError(e) {
        // @ts-ignore
        toast.error(e?.response?.data?.message ?? 'Unknown error');
      }
    }
  );

  const { mutate: finishLead } = useMutation(
    ['updateLead'],
    async ({ id, newData }: { id: string; newData: Lead }) => {
      return axios.put(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/updateLead`, {
        id,
        newData
      });
    },
    {
      onSuccess({ data }) {
        const { lead } = data;

        setCreatedLead(lead);
        toast.info('Congratulations! Here is your result');

        if (!lead) throw new Error('Unknown error');

        setHasFinished.on();
      },
      onError(e) {
        // @ts-ignore
        toast.error(e?.response?.data?.message ?? 'Unknown error');
      }
    }
  );

  const {
    state: { time },
    actions: { start: startCountdown }
  } = useCountdown({ countdownTime: 3000, interval: 1000 });

  const [timerValue, { start: startTimer, stop: stopTimer }] = useTimer({
    interval: 1000,
    started: false
  });

  const handleTestStart = () => {
    createLead();
  };

  const handleTestFinish = () => {
    const timeInMinutes = timerValue / (60 * 1000);
    const wordsNumber = 490;

    const wordSpeed = Math.round((wordsNumber ?? 0) / (timeInMinutes ?? 1));

    if (wordSpeed > 1000) {
      toast.error('This is way too fast!');
      return null;
    }

    setHasFinished.on();
    stopTimer();

    const result: Lead['result'] = {
      essayId: selectedEssay.id,
      type: 'speed-read',
      category: textConfiguration.category,
      wordsNumber,
      wordSpeed,
      timestamp: +new Date()
    };

    finishLead({
      id: createdLead?.id ?? '',
      // @ts-ignore
      newData: {
        ...(createdLead ?? {}),
        result
      }
    });
  };

  const getTestTypeOptions = useMemo(() => difficultTestTypeRelation[lead.programEducationLevel as DifficultLevel], [
    lead.programEducationLevel
  ]);

  useEffect(() => {
    if (time === 0) {
      startTimer();
    }
  }, [time]);

  useEffect(() => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    if (windowWidth < 992) setMobileStep(1);
  }, []);

  return (
    <>
      <BasePage background="white" spacing="md" position="relative" zIndex="1">
      <GoogleReCaptcha onVerify={(token) => setReCaptchaVerificationToken(token)} />
        <PageLoading isLoading={freeEssaysQuery.isLoading}>
          <BasePageTitle
            width="60%"
            marginX="auto"
            display="flex"
            paddingBottom="md"
            paddingX={{ xs: 'lg', lg: 'none' }}
            textAlign={{ xs: 'center', lg: 'left' }}
            alignItems={{ xs: 'center', lg: 'baseline' }}
            justifyContent={{ xs: 'center', lg: 'space-between' }}
            title="MindFlow's Free Speed Reading Test"
          >
            <ChakraFlex display={{ xs: 'none', lg: 'flex' }} alignItems="center">
              <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.66312 44.8164H31.3344C32.4344 44.8164 33.3262 43.9247 33.3262 42.8246V2.6637C33.3262 1.56369 32.4345 0.671875 31.3344 0.671875H11.2105C10.3428 0.671875 9.51052 1.0166 8.89687 1.63016L1.62967 8.39953C1.01611 9.0131 0.671387 9.84534 0.671387 10.7131V42.8247C0.671387 43.9247 1.56311 44.8164 2.66312 44.8164Z"
                  fill="white"
                />
                <path
                  d="M31.3355 0.671875H28.6479C29.748 0.671875 30.6398 1.56369 30.6398 2.6637V42.8247C30.6398 43.9247 29.748 44.8165 28.6479 44.8165H31.3355C32.4355 44.8165 33.3273 43.9247 33.3273 42.8247V2.6637C33.3273 1.56369 32.4356 0.671875 31.3355 0.671875Z"
                  fill="#70AACB"
                />
                <path
                  d="M1.12402 9.82867H8.23695C9.39116 9.82867 10.3268 8.89305 10.3268 7.73884V1.04688"
                  fill="#70AACB"
                />
                <path
                  d="M28.603 10.3886C28.603 7.10519 25.9411 4.44336 22.6577 4.44336C19.3742 4.44336 16.7124 7.10519 16.7124 10.3886C16.7124 13.0404 18.4489 15.2858 20.8464 16.052L22.8504 19.523L24.9582 15.8722C27.0992 14.9728 28.603 12.8564 28.603 10.3886Z"
                  fill="#94D4D6"
                />
                <path
                  d="M22.6587 4.44336C22.1964 4.44336 21.747 4.49783 21.3149 4.5978C23.9509 5.20716 25.9165 7.56753 25.9165 10.3887C25.9165 12.8565 24.4127 14.9729 22.2716 15.8722L21.5075 17.1955L22.8513 19.523L24.9592 15.8722C27.1002 14.9729 28.604 12.8565 28.604 10.3887C28.604 7.10519 25.9422 4.44336 22.6587 4.44336Z"
                  fill="#70AACB"
                />
                <path
                  d="M31.3364 0H11.2123C10.1631 0 9.17645 0.406983 8.43263 1.14623L1.17368 7.9079L1.15666 7.92439C0.411763 8.66919 0.00146484 9.65964 0.00146484 10.7131V28.3294C0.00146484 28.7005 0.3022 29.0013 0.673349 29.0013C1.0445 29.0013 1.34523 28.7005 1.34523 28.3294V10.7131C1.34523 10.642 1.34882 10.5714 1.35437 10.5014H8.23904C9.76189 10.5014 11.0008 9.26242 11.0008 7.73966V1.353C11.0708 1.34735 11.1413 1.34377 11.2123 1.34377H31.3364C32.0642 1.34377 32.6562 1.93583 32.6562 2.66371V8.23498C32.6562 8.60604 32.957 8.90686 33.3281 8.90686C33.6992 8.90686 34 8.60604 34 8.23498V2.66371C34.0001 1.19488 32.8052 0 31.3364 0V0ZM9.65698 7.73966C9.65698 8.52156 9.02084 9.15761 8.23904 9.15761H1.86169C1.9338 9.06139 2.01273 8.96939 2.09882 8.88258L9.35687 2.12181L9.37389 2.10533C9.46312 2.0161 9.55781 1.9344 9.65698 1.86005V7.73966Z"
                  fill="#333333"
                />
                <path
                  d="M33.3267 10.25C32.9556 10.25 32.6548 10.5508 32.6548 10.9219V42.8239C32.6548 43.5518 32.0628 44.1439 31.335 44.1439H2.66362C1.93583 44.1439 1.34377 43.5518 1.34377 42.8239V31.0163C1.34377 30.6453 1.04303 30.3444 0.671884 30.3444C0.300735 30.3444 0 30.6453 0 31.0163V42.824C0 44.2929 1.19488 45.4877 2.66362 45.4877H31.3349C32.8037 45.4877 33.9985 44.2929 33.9985 42.824V10.9219C33.9986 10.5508 33.6978 10.25 33.3267 10.25Z"
                  fill="#333333"
                />
                <path
                  d="M22.8379 13.7237C23.209 13.7237 23.5098 13.4229 23.5098 13.0519V10.5664C23.5098 10.1954 23.209 9.89453 22.8379 9.89453C22.4668 9.89453 22.166 10.1954 22.166 10.5664V13.0519C22.166 13.4229 22.4668 13.7237 22.8379 13.7237Z"
                  fill="#333333"
                />
                <path
                  d="M22.8379 9.33515C23.209 9.33515 23.5098 9.03432 23.5098 8.66327V8.08204C23.5098 7.71098 23.209 7.41016 22.8379 7.41016C22.4668 7.41016 22.166 7.71098 22.166 8.08204V8.66327C22.166 9.03432 22.4668 9.33515 22.8379 9.33515Z"
                  fill="#333333"
                />
                <path
                  d="M22.269 19.8589C22.3891 20.0668 22.6108 20.1948 22.8509 20.1948C23.091 20.1948 23.3127 20.0667 23.4327 19.8589L25.4307 16.3983C27.7741 15.3176 29.2753 12.9836 29.2753 10.3886C29.2753 6.73996 26.3069 3.77148 22.6582 3.77148C19.0095 3.77148 16.041 6.73996 16.041 10.3886C16.041 13.1904 17.7782 15.6563 20.3911 16.6062L22.269 19.8589ZM17.3847 10.3886C17.3847 7.48091 19.7504 5.11525 22.6581 5.11525C25.5658 5.11525 27.9315 7.48091 27.9315 10.3886C27.9315 12.5184 26.6624 14.4277 24.6984 15.2526C24.563 15.3094 24.4501 15.4091 24.3767 15.5362L22.8508 18.1792L21.4286 15.716C21.3451 15.5712 21.2105 15.4628 21.0513 15.4119C18.8583 14.7111 17.3847 12.6924 17.3847 10.3886Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 16.3985H12.4305C12.8017 16.3985 13.1024 16.0976 13.1024 15.7266C13.1024 15.3555 12.8017 15.0547 12.4305 15.0547H6.75685C6.3857 15.0547 6.08496 15.3555 6.08496 15.7266C6.08496 16.0976 6.3857 16.3985 6.75685 16.3985Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 18.9063H12.4305C12.8017 18.9063 13.1024 18.6054 13.1024 18.2344C13.1024 17.8633 12.8017 17.5625 12.4305 17.5625H6.75685C6.3857 17.5625 6.08496 17.8633 6.08496 18.2344C6.08496 18.6054 6.3857 18.9063 6.75685 18.9063Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 23.8692H28.1377C28.5089 23.8692 28.8096 23.5683 28.8096 23.1973C28.8096 22.8262 28.5089 22.5254 28.1377 22.5254H6.75685C6.3857 22.5254 6.08496 22.8262 6.08496 23.1973C6.08496 23.5683 6.3857 23.8692 6.75685 23.8692Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 26.377H28.1377C28.5089 26.377 28.8096 26.0761 28.8096 25.7051C28.8096 25.334 28.5089 25.0332 28.1377 25.0332H6.75685C6.3857 25.0332 6.08496 25.334 6.08496 25.7051C6.08496 26.0761 6.3857 26.377 6.75685 26.377Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 30.3946H24.0825C24.4537 30.3946 24.7544 30.0937 24.7544 29.7227C24.7544 29.3516 24.4537 29.0508 24.0825 29.0508H6.75685C6.3857 29.0508 6.08496 29.3516 6.08496 29.7227C6.08496 30.0937 6.3857 30.3946 6.75685 30.3946Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 32.9024H28.1377C28.5089 32.9024 28.8096 32.6015 28.8096 32.2305C28.8096 31.8594 28.5089 31.5586 28.1377 31.5586H6.75685C6.3857 31.5586 6.08496 31.8594 6.08496 32.2305C6.08496 32.6015 6.3857 32.9024 6.75685 32.9024Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 36.9199H28.1377C28.5089 36.9199 28.8096 36.6191 28.8096 36.2481C28.8096 35.877 28.5089 35.5762 28.1377 35.5762H6.75685C6.3857 35.5762 6.08496 35.877 6.08496 36.2481C6.08496 36.6191 6.3857 36.9199 6.75685 36.9199Z"
                  fill="#333333"
                />
                <path
                  d="M6.75685 39.4278H17.7866C18.1577 39.4278 18.4585 39.1269 18.4585 38.7559C18.4585 38.3848 18.1577 38.084 17.7866 38.084H6.75685C6.3857 38.084 6.08496 38.3848 6.08496 38.7559C6.08496 39.1269 6.3857 39.4278 6.75685 39.4278Z"
                  fill="#333333"
                />
              </svg>
              <Timer marginLeft="0.75rem" time={timerValue} />
            </ChakraFlex>
          </BasePageTitle>
          <ChakraFlex maxWidth={{ xs: '100%', lg: '60%' }} marginX="auto" flexDirection="column">
        <>
                <ChakraFlex flexDirection="column">
                  {(!mobileStep || mobileStep === 1) && (
                    <>
                      <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
                        Welcome!
                      </ChakraHeading>
                      <ChakraText>
                        This is{' '}
                        <ChakraText as="span">
                          MindFlow's free speed reading test.
                        </ChakraText>{' '}
                        To begin, choose the level of the test you want to take, set the test preferences, input your
                        information on the form and hit start to begin!
                      </ChakraText>
                    </>
                  )}
                  {(!mobileStep || mobileStep === 2) && (
                    <SpeedReadConfiguration
                      onChange={(configuration) => setTextConfiguration(configuration)}
                      essay={selectedEssay}
                    />
                  )}
                  {/* {!mobileStep && <ChakraDivider marginY="lg" />} */}
                  <ChakraFlex flexDirection="column" paddingTop="36px">
                    {(!mobileStep || (mobileStep === 3)) && (
                      <ChakraFlex flexDirection="column">
                        <ChakraFlex alignItems="left">
                          <ChakraHeading marginBottom="md" fontSize="md" width="250px">
                            Input your information
                          </ChakraHeading>
                          <ChakraDivider borderColor="gray.400" paddingTop="md"/>
                        </ChakraFlex>
                        <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }}>
                          <ChakraFormControl
                            isRequired
                            maxWidth="355px"
                            marginBottom={{ xs: 'sm', lg: 'none' }}
                            marginRight={{ xs: 'none', lg: 'xl' }}
                          >
                            <ChakraFormLabel>Name</ChakraFormLabel>
                            <ChakraInput
                              placeholder="Student"
                              borderRadius="sm"
                              value={lead.name}
                              onChange={(ev) => setLead((prevState) => ({ ...prevState, name: ev.target.value }))}
                            />
                          </ChakraFormControl>

                          <ChakraFormControl isRequired maxWidth="355px">
                            <ChakraFormLabel>Email</ChakraFormLabel>
                            <ChakraInput
                              type="email"
                              placeholder="student@mindflow.com"
                              borderRadius="sm"
                              value={lead.email}
                              onChange={(ev) => setLead((prevState) => ({ ...prevState, email: ev.target.value }))}
                            />
                          </ChakraFormControl>
                        </ChakraFlex>
                        <ChakraText color="ui.600" fontWeight="bold" marginBottom={{ xs: 'none', lg: 'lg' }} marginTop="md">
                          <ChakraText as="span" color="#FF714D">
                            Instruction:
                          </ChakraText>{' '}
                          Read the following essay the way you normally read, after you finish it, press the{' '}
                          <ChakraText as="span" color="green.500">
                            "finish button".
                          </ChakraText>{' '}
                          <ChakraText as="span" display={{ xs: 'none', lg: 'unset' }}>
                          </ChakraText>
                        </ChakraText>
                        <ChakraText display={{ xs: 'unset', lg: 'none' }} marginY="sm" fontWeight="bold">
                          Click start to begin your free speed reading test
                        </ChakraText>
                        {/*
                        <ChakraText display={{ xs: 'unset', lg: 'none' }} fontWeight="bold">
                          <ChakraText as="span" color="orange.500">
                            Warning:{' '}
                          </ChakraText>{' '}
                          You wont be able to restart your test after you begin it.
                        </ChakraText>
                        */}
                      </ChakraFlex>
                    )}

                    {(!mobileStep || mobileStep === 3) && (
                      <ChakraFlex flexDirection="column">
                        {/*
                        <ChakraHeading
                          fontSize="md"
                          textStyle="title-with-border-bottom"
                          marginBottom="md"
                          display={{ xs: 'flex', lg: 'none' }}
                        >
                          Before you begin:
                        </ChakraHeading>
                        <ChakraText color="ui.600" marginBottom="lg" display={{ xs: 'unset', lg: 'none' }}>
                        Click start to begin your free speed reading test
                        </ChakraText>


                        <ChakraFlex marginTop="md" marginBottom={lead.programPreparation ? 'md' : 'none'}>
                          <ChakraCheckbox
                            isChecked={lead.programPreparation}
                            onChange={({ target }) =>
                              setLead((previous) => ({ ...previous, programPreparation: target.checked }))
                            }
                          >
                            Are you preparing for an admissions test
                          </ChakraCheckbox>
                        </ChakraFlex>

                        <ChakraFlex width="100%" alignItems="center" marginY="lg">
                          <ChakraText whiteSpace="nowrap" marginRight="md" color="blue.500">
                            Where did you heard about us?
                          </ChakraText>
                        </ChakraFlex>

                        <ChakraSimpleGrid columns={2} gap="md">
                          <ChakraFlex flexDirection="column">
                            <ChakraFormLabel>Select an option </ChakraFormLabel>
                            <ChakraSelect
                              required
                              borderColor="gray.500"
                              defaultValue="other"
                              value={lead.whereDidYouHearAboutUs}
                              onChange={(ev) =>
                                setLead((prevState) => ({ ...prevState, whereDidYouHearAboutUs: ev.target.value }))
                              }
                            >
                              <option value="" disabled>
                                Not selected
                              </option>
                              {Object.entries(whereDidYouHearAboutUsOptions).map(([key, value]) => (
                                <option key={key} value={key}>
                                  {value}
                                </option>
                              ))}
                            </ChakraSelect>
                          </ChakraFlex>

                          {WHERE_DID_YOU_HEAR_ABOUT_US_DESCRIPTIVE_OPTIONS.includes(
                            lead.whereDidYouHearAboutUs as WhereDidYouHearAboutUs
                          ) && (
                            <ChakraFlex flexDirection="column">
                              <ChakraFormLabel>Where/Who?</ChakraFormLabel>
                              <ChakraInput
                                required
                                value={lead.whereDidYouHearAboutUsObservation}
                                borderColor="gray.500"
                                onChange={(ev) =>
                                  setLead((prevState) => ({
                                    ...prevState,
                                    whereDidYouHearAboutUsObservation: ev.target.value
                                  }))
                                }
                              />
                            </ChakraFlex>
                          )}
                        </ChakraSimpleGrid>
                        */}


                        {/*
                        {lead?.programPreparation && (
                          <ChakraFlex flexDirection={{ xs: 'column', lg: 'row' }}>
                            <ChakraFormControl
                              isRequired
                              maxWidth="355px"
                              marginRight={{ xs: 'none', lg: 'xl' }}
                              marginBottom={{ xs: 'sm', lg: 'none' }}
                            >
                              <ChakraFormLabel>Education level</ChakraFormLabel>
                              <ChakraSelect
                                borderRadius="sm"
                                value={lead.programEducationLevel}
                                onChange={({ target }) =>
                                  setLead((previous) => ({ ...previous, programEducationLevel: target.value }))
                                }
                              >
                                <option value="">Select</option>
                                {Object.entries(userFriendlyDifficultLevel)?.map(([key, value], idx) => (
                                  <option key={idx} value={key}>
                                    {value}
                                  </option>
                                ))}
                              </ChakraSelect>
                            </ChakraFormControl>
                            <ChakraFormControl
                              isRequired
                              maxWidth="355px"
                              marginRight={{ xs: 'none', lg: 'xl' }}
                              marginBottom={{ xs: 'sm', lg: 'none' }}
                            >
                              <ChakraFormLabel>Test type</ChakraFormLabel>
                              <ChakraSelect
                                borderRadius="sm"
                                value={lead.programTestType}
                                isDisabled={!lead.programEducationLevel}
                                onChange={({ target }) =>
                                  setLead((previous) => ({ ...previous, programTestType: target.value }))
                                }
                              >
                                <option value="">Select</option>
                                {getTestTypeOptions?.map((option, idx) => (
                                  <option key={idx} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </ChakraSelect>
                            </ChakraFormControl>
                            <ChakraFormControl isRequired maxWidth="355px">
                              <ChakraFormLabel>Test date</ChakraFormLabel>
                              <ChakraInput
                                type="date"
                                placeholder="DD/MM/YYYY"
                                borderRadius="sm"
                                value={lead.programTestDate}
                                onChange={({ target }) =>
                                  setLead((previous) => ({ ...previous, programTestDate: target.value }))
                                }
                              />
                            </ChakraFormControl>
                          </ChakraFlex>
                        )}
                        */}
                        <ChakraButton
                          size="md"
                          width="140px"
                          marginY="xl"
                          colorScheme="blue"
                          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
                          display={{ xs: 'none', lg: 'flex' }}
                          leftIcon={<Icon name={!canStartTest || !!invalidLead ? 'lock' : 'play_dotted_circle'} />}
                          isDisabled={!canStartTest || !!invalidLead}
                          isLoading={isCreating}
                          onClick={handleTestStart}
                        >
                          Start Test
                        </ChakraButton>
                      </ChakraFlex>
                    )}
                  </ChakraFlex>
                  {hasStarted && (
                    <>
                      {time > 0 ? (
                        <ChakraFlex width="100%" marginTop={{ xs: 'none', lg: 'lg' }} justifyContent="center">
                          <ChakraHeading>{time.toString()[0]}</ChakraHeading>
                        </ChakraFlex>
                      ) : (
                        <SpeedReadTest
                          {...textConfiguration}
                          essay={selectedEssay}
                          onFinishTest={() => handleTestFinish()}
                        />
                      )}
                    </>
                  )}
                </ChakraFlex>
              </>

            {!hasStarted && !hasFinished && (
              <ChakraFlex display={{ xs: 'flex', lg: 'none' }} alignItems="center" flexDirection="column">
                <ChakraButton
                  marginTop="lg"
                  marginBottom="md"
                  isFullWidth={true}
                  boxShadow="lg"
                  borderRadius="xs"
                  colorScheme="blue"
                  isLoading={isCreating}
                  isDisabled={mobileStep === 3 && (!canStartTest || !!invalidLead)}
                  leftIcon={mobileStep === 3 ? <Icon name="lock" /> : <></>}
                  onClick={() =>
                    mobileStep === 4 ? handleTestStart() : !mobileStep ? setMobileStep(1) : setMobileStep(mobileStep + 1)
                  }
                >
                  {mobileStep === 3 ? 'Unlock Your Free Test' : mobileStep === 4 ? 'Start' : 'Next Step'}
                </ChakraButton>
                <ChakraText color="gray.500" fontWeight="normal" fontSize="sm">
                  {(mobileStep || 1) + '/4'}
                </ChakraText>
              </ChakraFlex>
            )}

          <ChakraDivider marginY="lg" />
            {(hasFinished) && (
              <SpeedReadResult lead={createdLead} />
            )}
          </ChakraFlex>
        </PageLoading>
      </BasePage>
      <Footer></Footer>
    </>
  );
};
