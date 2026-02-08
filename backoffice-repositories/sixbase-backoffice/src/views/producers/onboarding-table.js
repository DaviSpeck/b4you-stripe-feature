import { Table } from 'reactstrap';
import { questionsByUserType } from '../onboarding/modal-details';

export const OnboardingTable = ({ onboarding, user }) => {
  if (!onboarding) return null;

  const questions = questionsByUserType[onboarding.user_type] || {};

  return (
    <Table hover className="mt-3">
      <thead>
        <tr>
          <div className="title-table">Onboarding</div>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Tipo do usuário</th>
          <td>{user?.onboarding.user_type || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Instagram</th>
          <td>
            {user?.instagram ? (
              <a
                href={
                  user.instagram.startsWith('http')
                    ? user.instagram
                    : `https://www.instagram.com/${user.instagram.replace(
                        '@',
                        '',
                      )}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {user.instagram.startsWith('http')
                  ? user.instagram.split('/').pop()
                  : user.instagram}
              </a>
            ) : (
              '-'
            )}
          </td>
        </tr>
        <tr>
          <th scope="row">TikTok</th>
          <td>
            {user?.tiktok ? (
              <a
                href={
                  user.tiktok.startsWith('http')
                    ? user.tiktok
                    : `https://www.tiktok.com/@${user.tiktok.replace('@', '')}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {user.tiktok}
              </a>
            ) : (
              '-'
            )}
          </td>
        </tr>
        {Object.entries(questions).map(([key, question]) => (
          <tr key={key}>
            <th scope="row">{question}</th>
            <td>{onboarding[key] || '-'}</td>
          </tr>
        ))}
        <tr>
          <th scope="row">O que você deseja fazer na B4You?</th>
          <td>{user?.onboarding.signup_reason || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Você já vendeu algum produto digital ou físico?</th>
          <td>{user?.onboarding.has_sold || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Quanto você faturou nos últimos 12 meses?</th>
          <td>{user?.onboarding.revenue || '-'}</td>
        </tr>
      </tbody>
    </Table>
  );
};
