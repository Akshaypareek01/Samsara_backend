// routes/companyRoutes.js
import express from 'express';
import {
 createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
}  from '../Controllers/Company.Controllers.js';

const Companyrouter = express.Router();

Companyrouter.post('/companies', createCompany);
Companyrouter.get('/companies', getAllCompanies);
Companyrouter.get('/companies/:id', getCompanyById);
Companyrouter.put('/companies/:id', updateCompanyById);
Companyrouter.delete('/companies/:id', deleteCompanyById);

export default Companyrouter;
