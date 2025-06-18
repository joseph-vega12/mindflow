import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';

import { DifficultLevel, TestType } from 'types';
import { isEqual } from 'lodash';

export interface AnalyticsFilterForm {
  difficultLevel: DifficultLevel;
  testType: TestType;
  startDate: string;
  endDate: string;
}

export const FiltersFormProvider: FC = ({ children }) => {
  const methods = useForm<AnalyticsFilterForm>({
    defaultValues: {
      testType: null,
      difficultLevel: null,
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
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
