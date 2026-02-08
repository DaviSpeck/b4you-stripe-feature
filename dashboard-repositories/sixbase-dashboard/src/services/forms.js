import api from '../providers/api';

export async function getActiveForm(formType) {
  let pathParam = formType;

  if (typeof formType === 'number') {
    if (formType === 2) pathParam = 'creator';
    else if (formType === 3) pathParam = 'marca';
    else if (formType === 1) pathParam = 'personalizado';
  }

  const { data } = await api.get(`/onboarding/form/${pathParam}`);
  return data;
}

export async function submitAnswers(id_form, answers) {
  const { data } = await api.post('/onboarding/answers', {
    id_form,
    answers,
  });
  return data;
}