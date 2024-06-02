import axios from 'axios'
// 创建axios实例
const service = axios.create({
  timeout: 1000 * 3000,
})

service.interceptors.request.use(
  (config) => {
    config.headers.p = 'question'
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json;charset=utf-8'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function getFormData(params) {
  const formData = new FormData()
  Object.keys(params).forEach((item) => {
    formData.append(item, params[item])
  })
  return formData
}

export const getQuestionnaireByUuid = (data) => service.get('/api/question/getQuestionnaireByUuid', { params: data })

export const uploadFile = (data, config) => service.post('/api/system/upload', getFormData(data), { headers: { 'Content-Type': 'multipart/form-data' }, ...config })

export const addQuestionnaireRecord = (data) => service.put('/api/question/addQuestionnaireRecord', JSON.stringify(data))