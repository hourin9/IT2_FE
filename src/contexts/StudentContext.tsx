import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../services/api';
import { Student } from '../types';

const DEFAULT_STUDENT: Student = {
  id: 1,
  studentCode: '102230001',
  fullName: 'Nguyễn Văn An',
  className: '23T_DT1',
  faculty: 'Khoa Công nghệ Thông tin',
  gpa: 8.35,
  trainingPoint: 86,
  accumulatedCredits: 48,
  totalCredits: 135,
  email: '102230001@sv1.dut.udn.vn',
};

interface StudentContextValue {
  student: Student;
  isLoading: boolean;
}

const StudentContext = createContext<StudentContextValue>({
  student: DEFAULT_STUDENT,
  isLoading: false,
});

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['current-student'],
    queryFn: () => studentApi.getCurrentStudent(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <StudentContext.Provider value={{ student: data ?? DEFAULT_STUDENT, isLoading }}>
      {children}
    </StudentContext.Provider>
  );
};

export function useStudent() {
  return useContext(StudentContext);
}
