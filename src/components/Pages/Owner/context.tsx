import React, { createContext, FC, useContext, useMemo, useState } from 'react';

import { cloneDeep, uniqBy } from 'lodash';

import { formatTimestamp } from 'lib/utils';

import { DifficultLevel, TestType, UserDocumentWithId } from 'types';

export interface OwnerContextState {
  filterStudents?: UserDocumentWithId[];
  filterSearch?: string;
  filterTestType?: TestType;
  filterDifficultLevel?: DifficultLevel;
  filterInitialTestDate?: string;
  filterFinalTestDate?: string;
  getFilteredStudents?: UserDocumentWithId[];
  setFilterStudents?: (students: UserDocumentWithId[]) => void;
  setFilterSearch?: (search: string) => void;
  setFilterDifficultLevel?: (difficultLevel: DifficultLevel) => void;
  setFilterTestType?: (testType: TestType) => void;
  setFilterInitialTestDate?: (date: string) => void;
  setFilterFinalTestDate?: (date: string) => void;
}

export const OwnerContext = createContext<OwnerContextState>({});

export const OwnerContextProvider: FC = ({ children }) => {
  const [filterStudents, setFilterStudents] = useState<UserDocumentWithId[]>([]);
  const [filterSearch, setFilterSearch] = useState<string>();
  const [filterDifficultLevel, setFilterDifficultLevel] = useState<DifficultLevel>();
  const [filterTestType, setFilterTestType] = useState<TestType>();
  const [filterInitialTestDate, setFilterInitialTestDate] = useState<string>();
  const [filterFinalTestDate, setFilterFinalTestDate] = useState<string>();

  const getFilteredStudents = useMemo(() => {
    const clonedStudents = cloneDeep(filterStudents);
    const filteredStudents: UserDocumentWithId[] = [];

    if (filterTestType || filterSearch || (filterInitialTestDate && filterFinalTestDate)) {
      if (filterTestType) {
        const studentsByTestType = clonedStudents?.filter((student) => student.testType === filterTestType);
        filteredStudents.push(...(studentsByTestType as UserDocumentWithId[]));
      }

      if (filterSearch) {
        const studentsByName = clonedStudents?.filter((student) =>
          student.firstName.toLowerCase().match(filterSearch.toLowerCase())
        );

        filteredStudents.push(...(studentsByName as UserDocumentWithId[]));
      }

      if (filterInitialTestDate && filterFinalTestDate) {
        const studentsByName = clonedStudents?.filter(
          (student) =>
            formatTimestamp(student.examDate as number, 'YYYY-MM-DD') >= filterInitialTestDate &&
            formatTimestamp(student.examDate, 'YYYY-MM-DD') <= filterFinalTestDate
        );
        filteredStudents.push(...(studentsByName as UserDocumentWithId[]));
      }

      return uniqBy(filteredStudents, 'id');
    }

    return clonedStudents;
  }, [filterTestType, filterSearch, filterInitialTestDate, filterFinalTestDate, filterStudents]);

  return (
    <OwnerContext.Provider
      value={{
        filterStudents,
        filterSearch,
        filterDifficultLevel,
        filterTestType,
        filterInitialTestDate,
        filterFinalTestDate,
        getFilteredStudents,
        setFilterStudents,
        setFilterSearch,
        setFilterDifficultLevel,
        setFilterTestType,
        setFilterInitialTestDate,
        setFilterFinalTestDate
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwnerContext = () => useContext(OwnerContext);
