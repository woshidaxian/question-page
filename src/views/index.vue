<template>
  <div class="box">
    <div v-if="beforeLabel">
      <div style="font-size: 30px;font-weight: bold;">问 卷 调 查</div>
      <div v-if="!errorInfo" style="font-size: 20px;margin-top: 40px;letter-spacing: 2px;">《{{ title }}》</div>
      <div style="font-size: 18px;margin-top: 20px">{{ new Date(date).format('yyyy-MM-dd hh:mm:ss') }}</div>
      <div v-if="errorInfo" style="margin-top: 50px;color: orange;font-size: 16px;font-weight: bold;">{{ errorInfo }}</div>
      <el-button v-else plain style="margin-top: 50px;" @click="start">开始作答</el-button>
    </div>
    <div v-else class="content-box">
      <div class="content-top">
        <div>{{ title }}</div>
        <el-button type="primary" plain size="mini" @click="save">提交</el-button>
      </div>
      <div class="content">
        <div class="item" v-for="(item, index) in content" :key="index">
          <div class="title">
            {{ (index + 1) + '、' + item.title }} ？
            <span v-if="item.required" style="font-size: 12px;font-weight: bold;color: rgb(212, 0, 0);">(必填)</span>
            <span style="margin-left: 10px;font-size: 12px;color: rgb(219, 151, 5);"
              v-if="item.type == 5 || item.type == 7">{{ item.fileLimit ? `限制${item.fileLimit}个` : '' }}&nbsp;&nbsp;{{
                item.fileSize ? `限制${item.fileSize}MB` : '' }}</span>
          </div>
          <div class="input-box" style="margin-top: 18px;">
            <!-- 单选 -->
            <div v-if="item.type == 1">
              <el-radio-group v-model="valueArr[index]">
                <el-radio v-for="(item2, index2) in item.options" :key="index2" :label="item2.label">{{ item2.label
                }}</el-radio>
              </el-radio-group>
            </div>

            <!-- 多选 -->
            <div v-if="item.type == 2">
              <el-checkbox-group v-model="valueArr[index]">
                <el-checkbox v-for="(item2, index2) in item.options" :key="index2" :label="item2.label"
                  :value="item2.label"></el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 单行文本 -->
            <div v-if="item.type == 3">
              <el-input placeholder="请输入" v-model="valueArr[index]"></el-input>
            </div>

            <!-- 多行文本 -->
            <div v-if="item.type == 4">
              <el-input type="textarea" :rows="5" placeholder="请输入" v-model="valueArr[index]"></el-input>
            </div>

            <!-- 图片 -->
            <div v-if="item.type == 5" style="display: flex;">
              <div
               class="img-box"
               v-for="(pItem, pi) in valueArr[index]" :key="pi"
              >
                <img :src="$store.state.thumbnailUrl + pItem.key" alt="">
                <div class="close" @click="delImg(index, pi)">x</div>
              </div>
              <el-upload
                v-if="!item.fileLimit||(item.fileLimit&&valueArr[index].length < item.fileLimit)"
                class="avatar-uploader" 
                action=""
                :show-file-list="false"
                :multiple="false"
                :before-upload="(e)=> handleUpload(e, item, index, 'img')"
                accept="image/png,image/jpeg,image/gif"
              >
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </div>

            <!-- 日期 -->
            <div v-if="item.type == 6">
              <el-date-picker v-model="valueArr[index]" type="date" placeholder="选择日期" format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"></el-date-picker>
            </div>

            <!-- 文件 -->
            <div v-if="item.type == 7">
              <div class="file-box">
                <div v-for="(item2, index2) in valueArr[index]" :key="index2" class="file-item">
                  <div>{{ item2.name }}</div>
                  <span style="font-size: 12px; color: red;" @click="delImg(index, index2)">删除</span>
                </div>
              </div>
              <el-upload
                v-if="!item.fileLimit || (item.fileLimit && valueArr[index].length < item.fileLimit)"
                action=""
                :show-file-list="false"
                :multiple="false"
                :before-upload="(e) => handleUpload(e, item, index, 'file')"
              >
                <el-button size="small" type="primary" plain>上传附件</el-button>
              </el-upload>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="fullLoading" class="full-loading">
      <el-progress style="width: 200px;" status="success" :text-inside="true" :percentage="progress" :show-text="false" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import '@/utils/time'
import { getQuestionnaireByUuid } from '@/server';
import * as getData from '@/server'
export default {
  name: 'index-page',
  components: {},
  data() {
    return {
      uuid: '',
      beforeLabel: true,
      timer: null,
      date: new Date(),
      title: '这是一份问卷调查',
      startTime: null,
      startLabel: false,
      content: '',
      id: '',
      valueArr: [],
      fullLoading: false,
      progress: 0,
      errorInfo: null
    }
  },

  mounted() {
    this.timer = setInterval(() => {
      this.date = new Date()
    }, 1000);
    this.uuid = this.$route.query.q
    this.title = this.$route.query.name
    if (this.uuid) {
      this.getQuestion()
    } else {
      this.$message.error('请确认地址是否正确！')
      this.errorInfo = '请确认地址是否正确!'
    }
  },

  methods: {
    async getQuestion() {
      try {
        const { data } = await getQuestionnaireByUuid({ uuid: this.uuid })
        if (data.code == 1) {
          this.startLabel = true
          this.title = data.data.title
          this.content = JSON.parse(data.data.content)
          this.id = data.data.id
          this.valueArr = new Array(this.content.length).fill('')
          this.content.forEach((item, index) => {
            if (item.type == 2 || item.type == 5 || item.type == 7) {
              this.valueArr[index] = []
            }
          })
          this.errorInfo = null
        } else {
          this.$message.error(data.message)
          this.errorInfo = data.message
        }
      } catch (error) {
        this.$message.error(error)
        this.errorInfo = error
      }
    },
    start() {
      if (!this.startLabel) {
        this.$message.error('请向发卷人确认问卷是否有效？')
      } else {
        this.beforeLabel = false
        this.startTime = new Date().getTime()
      }
    },
    handleUpload(e, row, index, type){
      if(row.fileLimit && (this.valueArr[index].length >= row.fileLimit)){
        this.$message.warning(`最多只能上传${row.fileLimit}个文件!`)
        return false
      }
      if(row.fileSize && e.size/1024/1024>row.fileSize){
        this.$message.warning(`文件大小不能超过${row.fileSize}MB!`)
        return false
      }
      this.progress = 0
      this.fullLoading = true
      let that = this
      getData.uploadFile({ 
        path: 'question/' + this.id + '/' + type, 
        file: e,
      },{
        onUploadProgress: function (progressEvent) {
          that.progress = progressEvent.progress * 100
        },
        timeout: 0
      }).then( res => {
        if (res.data.code == 1) {
          this.valueArr[index].push({
            name: e.name,
            key: res.data.data
          })
          this.$message.success('上传成功')
        }else{
          this.$message.error(res.data.message)
        }
        this.fullLoading = false
      }).catch(error => {
        this.$message.error(error)
        this.fullLoading = false
      })
      
      return false
    },
    delImg(index, pi){
      this.valueArr[index].splice(pi, 1)
      this.valueArr = [...this.valueArr]
    },
    save() {
      this.$confirm('确认要提交吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.checkVal()
      }).catch(() => {
        this.$message.info('取消操作!')
      });
    },
    checkVal(){
      for (let i = 0; i < this.content.length; i++) {
        if(this.content[i].required && !this.valueArr[i] && this.content[i].type != 7 && this.content[i].type != 5 && this.content[i].type != 2){
          this.$message.error(`第${i+1}题必填`)
          return
        }else if(this.content[i].required && !this.valueArr[i].length && (this.content[i].type == 7||this.content[i].type == 5 || this.content[i].type == 2)){
          this.$message.error(`第${i+1}题必填`)
          return
        }
      }
      let data = {
        uuid: this.uuid,
        answer: JSON.stringify(this.valueArr),
        questionId: this.id,
        useTime: new Date().getTime() - this.startTime,
        device: navigator.userAgent
      }
      getData.addQuestionnaireRecord(data).then(res => {
        if (res.data.code == 1) {
          this.$message.success('提交成功')
          setTimeout(() => {
            location.reload()
          }, 100);
        } else {
          this.$message.error(res.data.message)
        }
      })
    }
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}

</script>
<style lang='scss' scoped>
.box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #00a2ff91, #ffffff);
}

.content-box {
  width: 100%;
  max-width: 1100px;
  height: 100%;
  background: #fff;
  box-shadow: 0px 0px 10px -4px grey;
  display: flex;
  flex-direction: column;

  .content-top {
    display: flex;
    justify-content: space-between;
    padding: 8px 20px;
    align-items: center;
    border-bottom: 1px solid rgb(240, 240, 240);

    div {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .content {
    flex: 1;
    overflow: auto;
    padding: 20px;

    .item {
      margin-bottom: 40px;
      text-align: left;

      .title {
        font-size: 16px;
        font-weight: bold;
        text-align: left;
      }
    }
  }
}
.img-box{
  position: relative;
  width: 108px;
  height: 108px;
  margin-right: 14px;
  margin-bottom: 14px;
  img{
    width: 108px;
    height: 108px;
    object-fit: fill;
  }
  .close{
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #df0000;
    border-radius: 50%;
    color: #fff;
    line-height: 20px;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    zoom: 0.6;
  }
}
.file-box{
  margin-top: 20px;
  .file-item{
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    width: 240px;
    div{
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin-right: 5px;
      text-decoration: underline;
    }
    span{
      cursor: pointer;
    }
  }
}
.full-loading{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba($color: #000000, $alpha: 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 108px;
  height: 108px;
  line-height: 108px;
  text-align: center;
}

.avatar {
  width: 108px;
  height: 108px;
  display: block;
}
</style>
