import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { access_token } from '../../constants/token';
import { getUserInfo } from '../../services/user';

import styles from './Header.module.scss';

import Logout from '../../pages/Auth/Logout';

function Header() {
  const isAuthorized = !!access_token;
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (isAuthorized) {
      getUserInfo()
        .then((data) => {
          setName(data.name);
          setSurname(data.surname);
          setRole(data.role);
        })
        .catch((error) => console.log(error));
    }
  }, [isAuthorized]);

  const makeRoleOnVietnamese = (role) => {
    switch (role) {
      case 'employer':
        role = 'Nhà tuyển dụng';
        break;
      case 'applicant':
        role = 'Ứng viên';
        break;
      case 'notConfirmedEmployer':
        role = 'Nhà tuyển dụng chưa xác nhận';
        break;
      case 'admin':
        role = 'Quản trị viên';
        break;
      default:
        role = 'Người dùng';
    }
    return role;
  }

  const translatedRole = makeRoleOnVietnamese(role)

  return (
    <div className={styles.header}>
      <Link to='/' className={styles.logo}>
        <img src="../img/logo.png" alt="Logo" style={{ width: "50px", height: "50px" }} />
        <h3 className={`title`}>TopCV</h3>
      </Link>

      <div className={styles.menu}>
        <ul>
          <li>
            <Link to='/vacancies' className={`link-text`}>Việc làm</Link>
          </li>
          <li>
            <Link to='/applicants' className={`link-text`}>Ứng viên</Link>
          </li>
          <li>
            <Link to='/employers' className={`link-text`}>Nhà tuyển dụng</Link>
          </li>
        </ul>
      </div>

      <div className={styles.menu}>
        <ul>
          {isAuthorized ? (
            <>
              {role === 'admin' ? (
                <li>
                  <Link to='/admin' className={`link-text`}>Bảng quản trị</Link>
                </li>
              ) : null
              }
              <li>
                <p className={`green-text`}>Bạn là {translatedRole}</p>
              </li>
              <li>
                <p className={`gray-text`}>{name} {surname}</p>
              </li>
              <li>
                <Logout />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/login' className={`link-text`}>Đăng nhập</Link>
              </li>
              <li>
                <Link to='/register' className={`link-text`}>Đăng ký</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Header;
