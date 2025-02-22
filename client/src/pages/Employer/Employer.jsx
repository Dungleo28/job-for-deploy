import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import jwt_decode from 'jwt-decode';
import { access_token } from '../../constants/token';
import { getUserInfo } from '../../services/user';
import { createNewEmployer, getEmployerByUserID, getPaginatedEmployers, searchEmployers } from '../../services/employer';
import { createNewVacancy, getVacanciesByEmployer } from '../../services/vacancy';

import styles from './Employer.module.scss';

import ErrorBox from '../../components/ErrorBox/ErrorBox';
import SearchForm from '../../components/Forms/SearchForm/SearchForm';
import EmployerCard from '../../components/Cards/EmployerCard/EmployerCard';
import VacancyCard from '../../components/Cards/VacancyCard/VacancyCard'
import BlueButton from '../../components/Buttons/BlueButton/BlueButton';
import GreenButton from '../../components/Buttons/GreenButton/GreenButton';
import TextareaForm from '../../components/Forms/TextareaForm/TextareaForm';

function Employer() {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthorized = access_token;
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [showEmployerCreateForm, setShowEmployerCreateForm] = useState(false);
  const [showVacancyCreateForm, setShowVacancyCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('activeVacancies');
  const [vacancies, setVacancies] = useState([])
  const [employers, setEmployers] = useState([])
  const [employerID, setEmployerID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const inputConfigSearch = [
    { title: 'Tìm kiếm theo nhà tuyển dụng', type: 'text', name: 'search', placeholder: 'Ví dụ: MBBank' },
  ]

  useEffect(() => {
    if (isAuthorized) {
      getUserInfo()
        .then((data) => {
          setRole(data.role);
          setIsLoading(false);
        })
        .catch((error) => console.log(error));
    }
  }, [isAuthorized]);

  useEffect(() => {
    const fetchData = async () => {
      if (role === 'employer') {
        try {
          const decoded_token = jwt_decode(access_token);
          const userID = decoded_token.sub;

          const employerData = await getEmployerByUserID(userID);
          const employerID = employerData.id;
          setEmployerID(employerID);

          const vacanciesData = await getVacanciesByEmployer(employerID);
          setVacancies(vacanciesData);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchData();
  }, [role]);

  useEffect(() => {
    if (role === 'applicant' || role === 'admin') {
      const urlParams = new URLSearchParams(window.location.search);
      const currentPage = parseInt(urlParams.get('page')) || 1;
      const query = urlParams.get('query');

      if (!query) {
        getPaginatedEmployers(currentPage, true)
          .then((data) => {
            setEmployers(data);
          })
          .catch((error) => console.log(error));
      }

      if (query !== null) {
        searchEmployers(query)
          .then((results) => {
            setSearchResults(results);
          })
          .catch((error) => console.log(error));
      }
    }
  }, [role]);

  const handleSearchClick = async (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    const results = await searchEmployers(query);
    setSearchResults(results);
    setEmployers([]);
    setCurrentPage(1);
    const searchParams = new URLSearchParams({ query });
    navigate(`/employers/search?${searchParams.toString()}`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleBackClick = () => {
    navigate('/employers')
    window.location.reload();
  };

  const renderContent = () => {
    if (role === 'user') {
      const handleBecomeEmployerClick = () => {
        setShowEmployerCreateForm(true);
      };

      const handleCreateEmployerSubmit = (e) => {
        e.preventDefault();
        createNewEmployer(e.target.company_name.value, e.target.company_description.value, e.target.contact.value, e.target.website.value, setError, setShowError);
      };

      const inputConfigs = [
        {
          title: 'Tên công ty',
          type: 'text',
          name: 'company_name'
        },
        {
          title: 'Địa chỉ liên hệ (thư hoặc điện thoại)',
          type: 'text',
          name: 'contact'
        },
        {
          title: 'Trang web của công ty (nếu không thì liên kết đến vị trí trong Bản đồ)',
          type: 'text',
          name: 'website'
        }
      ];
      const textareaConfigs = [
        {
          title: 'Mô tả công ty',
          type: 'text',
          name: 'company_description'
        }
      ];

      return (
        <div className={`section`}>
          {showEmployerCreateForm ? (
            <TextareaForm
              inputConfigs={inputConfigs}
              textareaConfigs={textareaConfigs}
              buttonTitle={'Gửi'}
              onSubmit={handleCreateEmployerSubmit}
            />
          ) : (
            <div className={`content`}>
                <p className={`dark-text center`}>Để xem trang này bạn phải là nhà tuyển dụng</p>
              <div className={`center`}>
                  <BlueButton title={'Trở thành nhà tuyển dụng'} onClick={handleBecomeEmployerClick} />
              </div>
            </div>
          )}
        {showError && <ErrorBox error={error} />}
        </div>
      );
    }
    else if (role === 'notConfirmedEmployer') {
      return <p className={`dark-text center`}>Đơn đăng ký của bạn đang được xem xét</p>;
    }
    else if (role === 'employer') {
      const handleCreateVacancyClick = () => {
        setShowVacancyCreateForm(true);
      };

      const handleLinkOn = (link) => {
        navigate(link);
      };

      const handleCreateVacancySubmit = (e) => {
        e.preventDefault();
        createNewVacancy(e.target.name.value, e.target.description.value,
          e.target.place.value, e.target.salary.value, e.target.experience.value, e.target.tags.value.trim().split(','), setError, setShowError, navigate);
      };

      const inputConfigs = [
        {
          title: 'Vị trí tuyển dụng',
          type: 'text',
          name: 'name'
        },
        {
          title: 'Địa điểm(Hà Nội,Hồ CHí Minh,Đà Nẵng)',
          type: 'text',
          name: 'place'
        },
        {
          title: 'Mức lương (Ví dụ: 10000000)',
          type: 'text',
          name: 'salary'
        },
        {
          title: 'Yêu cầu kinh nghiệm theo số năm (Ví dụ: 1)',
          type: 'text',
          name: 'experience'
        },
      ];
      const textareaConfigs = [
        {
          title: 'Mô tả công việc',
          type: 'text',
          name: 'description'
        },
        {
          title: 'Từ khoá (Nhập cách nhau bằng dấu phẩy, ví dụ: AI, Web)',
          type: 'text',
          name: 'tags'
        }
      ];

      const handleTabClick = (tab) => {
        setActiveTab(tab);
        getVacanciesByEmployer(employerID)
          .then((data) => {
            setVacancies(data);
          })
          .catch((error) => console.log(error));
      };

      const renderContent = () => {
        switch (activeTab) {
          case 'activedVacancies':
            return (
              <div className={`grid-cards`}>
                <div className={`grid-cards-content`}>
                  {vacancies.map((vacancy) => {
                    if (vacancy.is_confirmed && !vacancy.is_archived) {
                      return (
                        <VacancyCard
                          key={vacancy.id}
                          vacancy_id={vacancy.id}
                          company_name={"Công ty của bạn"}
                          name={vacancy.name}
                          created_at={vacancy.created_at}
                          description={vacancy.description}
                          place={vacancy.place}
                          salary={vacancy.salary}
                          experience={vacancy.experience}
                          tags={vacancy.tags}
                          is_confirmed={true}
                          is_archived={false}
                          role={role}
                          vacancies={vacancies}
                          setVacancies={setVacancies}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          case 'archivedVacancies':
            return (
              <div className={`grid-cards`}>
                <div className={`grid-cards-content`}>
                  {vacancies.map((vacancy) => {
                    if (vacancy.is_confirmed && vacancy.is_archived) {
                      return (
                        <VacancyCard
                          key={vacancy.id}
                          vacancy_id={vacancy.id}
                          company_name={"Công ty của bạn"}
                          name={vacancy.name}
                          created_at={vacancy.created_at}
                          description={vacancy.description}
                          place={vacancy.place}
                          salary={vacancy.salary}
                          experience={vacancy.experience}
                          tags={vacancy.tags}
                          is_confirmed={true}
                          is_archived={true}
                          role={role}
                          vacancies={vacancies}
                          setVacancies={setVacancies}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          case 'unconfirmedVacancies':
            return (
              <div className={`grid-cards`}>
                <div className={`grid-cards-content`}>
                  {vacancies.map((vacancy) => {
                    if (!vacancy.is_confirmed && vacancy.is_archived) {
                      return (
                        <VacancyCard
                          key={vacancy.id}
                          vacancy_id={vacancy.id}
                          company_name={"Công ty của bạn"}
                          name={vacancy.name}
                          created_at={vacancy.created_at}
                          description={vacancy.description}
                          place={vacancy.place}
                          salary={vacancy.salary}
                          experience={vacancy.experience}
                          tags={vacancy.tags}
                          is_confirmed={false}
                          is_archived={true}
                          role={role}
                          vacancies={vacancies}
                          setVacancies={setVacancies}
                          showButtons={false}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          default:
            return null;
        }
      };

      return (
        <div className={`section`}>
          {showVacancyCreateForm ? (
            <TextareaForm
              inputConfigs={inputConfigs}
              textareaConfigs={textareaConfigs}
              buttonTitle={'Gửi'}
              onSubmit={handleCreateVacancySubmit}
            />
          ) : (
            <div className={`content`}>
                <div className={`title`}>Chào mừng!</div>
              <div className={`buttons`}>
                  <GreenButton title={'Đăng một vị trí tuyển dụng'} onClick={handleCreateVacancyClick} />
                  <BlueButton title={'Xem ứng viên'} onClick={() => handleLinkOn('/applicants')} />
                  <BlueButton title={'Xem vị trí tuyển dụng đang đăng'} onClick={() => handleLinkOn('/vacancies')} />
              </div>
              <div className={`tab-menu`}>

                <button
                  className={activeTab === 'activedVacancies' ? 'active' : ''}
                  onClick={() => handleTabClick('activedVacancies')}>
                  Vị trí tuyển dụng đang hoạt động của tôi</button>

                <button
                  className={activeTab === 'archivedVacancies' ? 'active' : ''}
                  onClick={() => handleTabClick('archivedVacancies')}>
                  Vị trí tuyển dụng không hoạt động của tôi</button>

                <button
                  className={activeTab === 'unconfirmedVacancies' ? 'active' : ''}
                  onClick={() => handleTabClick('unconfirmedVacancies')}>
                    Vị trí tuyển dụng chưa được xác minh của tôi</button>

              </div>

              <div className={styles.employerCards}>{renderContent()}</div>
            </div>
          )}
          {showError && <ErrorBox error={error} />}
        </div>
      );
    }
    else {
      const goToNextPage = (currentPage) => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        setSearchResults([]);
        getPaginatedEmployers(nextPage, true, false)
          .then((data) => {
            setEmployers(data);
          })
          .catch((error) => console.log(error));
        navigate(`/employers?page=${nextPage}&confirmed=true`);
      };

      const goToPreviousPage = (currentPage) => {
        const previousPage = currentPage - 1;
        setCurrentPage(previousPage);
        setSearchResults([]);
        getPaginatedEmployers(previousPage, true)
          .then((data) => {
            setEmployers(data);
          })
          .catch((error) => console.log(error));
        navigate(`/employers?page=${previousPage}&confirmed=true`);
      };

      return (
        <div className={styles.employerSection}>
          <div className={`content`}>
            <h3 className={`title`}>Nhà tuyển dụng</h3>
            <SearchForm
              inputConfigs={inputConfigSearch}
              onSubmit={handleSearchClick}
            />
            <div className={`grid-cards`}>
              <div className={`grid-cards-content`}>
                {employers.length > 0 ? (
                  employers.map((employer) => (
                    <EmployerCard
                      key={employer.id}
                      employer_id={employer.id}
                      company_name={employer.company_name}
                      company_description={employer.company_description}
                      contact={employer.contact}
                      website={employer.website}
                      created_at={employer.created_at}
                      is_confirmed={true}
                      role={role}
                      employers={employers}
                      setEmployers={setEmployers}
                    />
                  ))
                ) : searchResults.length > 0 ? (
                  searchResults.map((employer) => (
                    <EmployerCard
                      key={employer.id}
                      employer_id={employer.id}
                      company_name={employer.company_name}
                      company_description={employer.company_description}
                      contact={employer.contact}
                      website={employer.website}
                      created_at={employer.created_at}
                      is_confirmed={true}
                      role={role}
                      employers={employers}
                      setEmployers={setEmployers}
                    />
                  ))
                ) : (
                  <div className='searchNotFound mt50px'>
                    <p className={`red-text`}>Không tìm thấy kết quả</p>
                    <GreenButton
                          title={"Quay lại trang nhà tuyển dụng"}
                      onClick={handleBackClick}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={`pagination`}>
              <div className={`pagination-content`}>

                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPreviousPage(currentPage)}>
                  Trang trước</button>

                <span>Trang hiện tại: {currentPage}</span>

                <button onClick={() => goToNextPage(currentPage)}>
                  Trang tiếp theo</button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className={styles.employer}>
      {isAuthorized ? (
        isLoading ? (
          <div>Loading...</div>
        ) : (
          renderContent()
        )
      ) : (
        <div className={`content`}>
            <p className={`dark-text center`}>Đăng nhập hoặc đăng ký</p>
          <div className={`buttons center`}>
              <GreenButton title={'Đăng nhập'} onClick={handleLoginClick} />
              <GreenButton title={'Đăng ký'} onClick={handleRegisterClick} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Employer;
