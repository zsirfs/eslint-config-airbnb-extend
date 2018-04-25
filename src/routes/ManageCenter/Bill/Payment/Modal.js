import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Row, Col, Button, Input, Form, Modal } from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 10 },
};
@Form.create()
export default class PaymentModal extends PureComponent {
  handleModalClose = () => {
    this.props.form.resetFields();
  }

  handleConfirm = () => {
    const { validateFields, getFieldsValue } = this.props.form;
    const { onOk, formValue, type, sortLength } = this.props;
    validateFields((err, value) => {
      if (!err) {
        onOk && onOk({
          ...value,
          ...{ create: { sort: sortLength } }[type],
          ...{ edit: { id: formValue.id } }[type],
        });
      }
    });
  }

  render() {
    const { visible, type, formValue, onOk, onCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={type == 'create' ? '新建支付方式' : '编辑支付方式'}
        visible={visible}
        onOk={this.handleConfirm}
        onCancel={onCancel}
        afterClose={this.handleModalClose}
      >
        <Form layout="horizontal">
          <FormItem label="名称" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: formValue.name,
              rules: [{ required: true, message: '名称不能为空' }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}