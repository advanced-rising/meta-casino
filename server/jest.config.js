module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@root/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.+(ts|tsx)'],
  // setupTestFrameworkScriptFile: '<rootDir>/src/test/setup.ts'
};
