export const projectFieldMapping = {
  id: { $toString: '$_id' },
  firstName: '$first_name',
  lastName: '$last_name',
  email: '$email',
  yearRegistered: '$year_registered',
  phoneCell: '$phone_cell',
};
