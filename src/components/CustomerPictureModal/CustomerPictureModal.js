import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classNames from 'classnames/bind'
import { Row, Col, Upload, Modal, Icon } from 'antd';
import styles from './CustomerPictureModal.less'

export default class CustomerPictureModal extends PureComponent {

  state = {
    previewVisible: false,
    previewImage: '',
    imageFileList: []
  }

  componentWillReceiveProps(nextProps) {
    // this.setState({
    //   imageFileList:nextProps.value
    // })
  }

  handleBeforeUpload = (file) => {
    file.url = URL.createObjectURL(file)
    let current = this.state.imageFileList;
    current.push(file)
    this.setState({
      imageFileList: [...current]
    })
    URL.revokeObjectURL(file.src)
    this.props.onChange(current)
    return false
  }

  handlePreview = (file) => {
    this.setState({
      previewVisible: !this.state.previewVisible,
      previewImage: file.url 
    })
  }

  handleCancel = () => {
    this.setState({
      previewVisible: !this.state.previewVisible
    })
  }

  hanldeRemove = (file) => {
    let current = this.state.imageFileList;
    const index = current.indexOf(file)
    current.splice(index,1)
    this.setState({
      imageFileList: [...current]
    })
    this.props.onChange(current)
  }

  render() {  
    const {itemImageLevel} = this.props
    const {previewVisible,previewImage,imageFileList} = this.state

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return (
      <div className={styles.pictureModal}>
        <Row>
          <Col span={21}>
            <Upload
              action = 'http://duoke3api.duoke.net/api/images'
              listType='picture-card'
              fileList={imageFileList}
              beforeUpload={this.handleBeforeUpload}
              onPreview={this.handlePreview}
              onRemove={this.hanldeRemove}
              multiple = {true}
            >
              {uploadButton}
            </Upload>
            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} className={styles.modalClosePostion}> 
              <img alt="image" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Col>
        </Row>
      </div>
    )
  }
}