import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';

import { DifficultLevel, TestType } from 'types';
import { isEqual } from 'lodash';

export interface AnalyticsFilterForm {
  difficultLevel: DifficultLevel;
  testType: TestType;
  startDate: string;
  endDate: string;
  showCleverStudents?: boolean;
  districtIdFilter?: string;
  searchStudents?: string;
  cleverLastSeenStart?: string;
  cleverLastSeenEnd?: string;
  whereDidYouHearAboutUs?: string;
}

export const FiltersFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const methods = useForm<AnalyticsFilterForm>({
    defaultValues: {
      testType: null,
      difficultLevel: null,
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      showCleverStudents: false,
      districtIdFilter: '',
      searchStudents: '',
      cleverLastSeenStart: '',
      cleverLastSeenEnd: '',
      whereDidYouHearAboutUs: ''
    }
  });

  const [oldFormValue, setOldFormValue] = useState(methods.getValues());

  const values = methods.watch();

  useEffect(() => {
    if (!isEqual(oldFormValue, values)) {
      const { difficultLevel, testType } = values;

      if (testType && difficultLevel) {
        const sameTestType = testType === oldFormValue.testType;

        if (sameTestType) {
          methods.setValue('testType', null);
          setOldFormValue((prevState) => ({ ...prevState, testType: null }));
        } else {
          methods.setValue('difficultLevel', null);
          setOldFormValue((prevState) => ({ ...prevState, difficultLevel: null }));
        }
      } else {
        setOldFormValue(values);
      }
    }
  }, [values]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
