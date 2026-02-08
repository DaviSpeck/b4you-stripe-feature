import { useState, useEffect } from 'react';
import api from '../../providers/api';
import { Tab } from 'react-bootstrap';

const parseInstagram = (instagram, instagram_link) => {
  if (instagram_link) {
    return {
      label: instagram || instagram_link,
      href: instagram_link,
    };
  }
  if (!instagram) return null;
  const raw = String(instagram).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/.*/, '')
    .replace(/^@/, '')
    .trim();
  if (!cleaned) return null;
  return {
    label: `@${cleaned}`,
    href: `https://instagram.com/${cleaned}`,
  };
};

const parseTikTok = (tiktok, tiktok_link) => {
  if (tiktok_link) {
    return {
      label: tiktok || tiktok_link,
      href: tiktok_link,
    };
  }
  if (!tiktok) return null;
  const raw = String(tiktok).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?tiktok\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*/, '')
    .trim();
  if (!cleaned) return null;
  return {
    label: `@${cleaned}`,
    href: `https://www.tiktok.com/@${cleaned}`,
  };
};

const AffiliateInfo = ({ activeAffiliate }) => {
  const [infoActiveAffiliate, setInfoActiveAffiliate] = useState({});
  const fetchData = () => {
    api
      .get(`/affiliates/${activeAffiliate.uuid}`)
      .then((response) => {
        setInfoActiveAffiliate(response.data);
      })
      .catch(() => {});
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {infoActiveAffiliate && (
        <Tab.Content>
          <table className='table'>
            <tbody>
              <tr>
                <td>Nome</td>
                <td>{infoActiveAffiliate.full_name}</td>
              </tr>
              <tr>
                <td>E-mail</td>
                <td>{infoActiveAffiliate.email}</td>
              </tr>
              <tr>
                <td>Celular</td>
                <td>{infoActiveAffiliate.whatsapp}</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td>
                  {(() => {
                    const ig = parseInstagram(
                      infoActiveAffiliate.instagram,
                      infoActiveAffiliate.instagram_link
                    );
                    if (!ig) return '-';
                    return (
                      <a
                        href={ig.href}
                        target='_blank'
                        rel='noreferrer'
                        style={{ color: '#5e72e4', textDecoration: 'underline' }}
                      >
                        {ig.label}
                      </a>
                    );
                  })()}
                </td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>
                  {(() => {
                    const tk = parseTikTok(
                      infoActiveAffiliate.tiktok,
                      infoActiveAffiliate.tiktok_link
                    );
                    if (!tk) return '-';
                    return (
                      <a
                        href={tk.href}
                        target='_blank'
                        rel='noreferrer'
                        style={{ color: '#5e72e4', textDecoration: 'underline' }}
                      >
                        {tk.label}
                      </a>
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </Tab.Content>
      )}
    </>
  );
};
export default AffiliateInfo;
