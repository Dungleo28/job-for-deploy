from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import engine
from models import (user, employer, applicant, vacancy, feedback, )
from routes import (
    auth as AuthRouter,
    user as UserRouter,
    employer as EmployerRouter,
    vacancy as VacancyRouter,
    applicant as ApplicantRouter,
    feedback as FeedbackRouter,
)

app = FastAPI(title="JobFinder", version="0.1")

user.Base.metadata.create_all(bind=engine)
employer.Base.metadata.create_all(bind=engine)
applicant.Base.metadata.create_all(bind=engine)
vacancy.Base.metadata.create_all(bind=engine)
feedback.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost",           # Để phát triển trên máy cục bộ (frontend trên localhost)
    "http://localhost:3000",      # Để phát triển frontend trên port 3000 (nếu sử dụng React, Vue,...)
    "https://myfrontend.com",     # Thêm domain frontend nếu deploy trên một server khác
    "https://job-for-deploy.onrender.com",  # Đảm bảo thêm domain backend của bạn (render)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Cho phép các origins trong danh sách
    allow_credentials=True,
    allow_methods=["*"],           # Cho phép tất cả các phương thức HTTP
    allow_headers=["*"],           # Cho phép tất cả các header
)

app.include_router(AuthRouter.router, tags=['auth'], prefix='/api')
app.include_router(UserRouter.router, tags=['users'], prefix='/api')
app.include_router(EmployerRouter.router, tags=['employers'], prefix='/api')
app.include_router(VacancyRouter.router, tags=['vacancies'], prefix='/api')
app.include_router(ApplicantRouter.router, tags=['applicants'], prefix='/api')
app.include_router(FeedbackRouter.router, tags=['feedbacks'], prefix='/api')


@app.get("/")
def root():
    return {"message": "Go to /docs"}
