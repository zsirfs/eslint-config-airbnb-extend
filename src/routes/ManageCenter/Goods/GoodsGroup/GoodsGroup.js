import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Row, Col, Card, Button, message, Table, Icon, Popconfirm, Divider } from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import breadCrumbList from '../../../../common/breadCrumbList';
import GoodsGroupModal from './Modal';
import styles from './GoodsGroup.less';
@connect(state => ({
  goodsGroup: state.goodsGroup,
}))
export default class GoodsGroup extends PureComponent {
  state = {
    modalVisibel: false, // modal的显示隐藏
    modalType: '', // model是编辑还是新建
    formValue: {}, // model编辑时的当前值
    parentItem: {}, // 子分类编辑的父分组的值
    isSort: false, // 是否排序
  }

  componentDidMount() {
    this.props.dispatch({ type: 'goodsGroup/getList' });
  }

  // modal新建
  handleModalCreate = (key, item) => {
    this.setState({
      modalVisibel: true,
      modalType: key,
      formValue: {},
      parentItem: item,
    });
  }

  // modal取消
  handleModalCancel = () => {
    this.setState({
      modalVisibel: false,
    });
  }

  // modal编辑
  handleModalEdit = (item, key) => {
    this.setState({
      modalVisibel: true,
      modalType: key,
      formValue: item,
    });
  }

  // model完成
  handleModalOk = (value) => {
    this.setState({
      modalVisibel: false,
    });
    this.props.dispatch({ type: `goodsGroup/${this.state.modalType.indexOf('Create') > -1 ? 'createSingle' : 'editSingle'}`, payload: value }).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
      }
      this.props.dispatch({ type: 'goodsGroup/getList' });
    }).catch(()=>{
      this.state.modalType.indexOf('Create') > -1 ? message.error('创建失败') : message.error('编辑失败')
    });
  }

  // 删除
  handleDeleteSingle = (item) => {
    this.props.dispatch({ type: 'goodsGroup/deleteSingle',
      payload: {
        id: item.uid ? item.uid : item.id,
      } }).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
      } else {
        this.props.dispatch({ type: 'goodsGroup/getList' });
      }
    }).catch(()=>{
      message.error('删除失败')
    });
  }

  // 排序开始
  handleSortStart = () => {
    this.setState({
      isSort: true,
    });
  }

  // 排序取消
  handleSortCancel = () => {
    this.setState({
      isSort: false,
    });
    // 排序取消 或 排序完成， 获取最新数据
    this.props.dispatch({ type: 'goodsGroup/getList' });
  }

  // 排序移动
  handleSortMove = (item, moveWay) => {
    this.props.dispatch({ type: 'goodsGroup/setSortMove',
      payload: {
        item,
        moveWay,
      } });
  }

  // 排序完成
  handleSortOk = () => {
    this.props.dispatch({ type: 'goodsGroup/editSort', payload: this.props.goodsGroup.goodsGroups }).then(() => {
      this.handleSortCancel();
    }).catch(()=>{
      message.error('排序失败')
      this.handleSortCancel();
    });
  }

  render() {
    const { goodsGroups } = this.props.goodsGroup;
    const { modalVisibel, modalType, formValue, parentItem, isSort } = this.state;
    const action = (
      <div>
        {
          isSort ? (
            <div>
              <Popconfirm title="确认取消自定义排序" onConfirm={this.handleSortCancel}>
                <Button >取消</Button>
              </Popconfirm>
              <Button type="primary" onClick={this.handleSortOk}>确认</Button>
            </div>
          ) : (
            <div>
              <Button onClick={this.handleSortStart}>自定义排序</Button>
              <Button type="primary" onClick={this.handleModalCreate.bind(null, 'groupCreate')}>新建商品分组</Button>
            </div>
          )
        }
      </div>
    );

    const columns = [{
      title: '名称',
      dataIndex: 'name',
    }, {
      title: '操作',
      dataIndex: 'operation',
      width: 172,
      render: (text, record) => (
        <div>
          {
            isSort ? (
              <div>
                {/* 子分类占位 */}
                {record.uid ? <a style={{ visibility: 'hidden' }}>你好</a> : null}
                {/* 子分类隐藏分割线 */}
                {record.uid ? <Divider style={{ visibility: 'hidden' }} type="vertical" /> : null}
                {/* 下标为首隐藏上移 */}
                <a onClick={this.handleSortMove.bind(null, record, 'up')} style={{ display: (goodsGroups.findIndex(n => n.id == record.id) == 0 || record.uid && goodsGroups.find(n => n.id == record.parent_id).children.findIndex(n => n.uid == record.uid) == 0) ? 'none' : 'inline-block' }}>上移</a>
                {/* 下标为首或为尾隐藏分割线 */}
                <Divider type="vertical" style={{ display: (goodsGroups.findIndex(n => n.id == record.id) == 0 || goodsGroups.findIndex(n => n.id == record.id) == goodsGroups.length - 1 || record.uid && goodsGroups.find(n => n.id == record.parent_id).children.findIndex(n => n.uid == record.uid) == 0 || record.uid && goodsGroups.find(n => n.id == record.parent_id).children.findIndex(n => n.uid == record.uid) == goodsGroups.find(n => n.id == record.parent_id).children.length - 1) ? 'none' : 'inline-block' }} />
                {/* 下标为尾隐藏下移 */}
                <a onClick={this.handleSortMove.bind(null, record, 'down')} style={{ display: (goodsGroups.findIndex(n => n.id == record.id) == goodsGroups.length - 1 || record.uid && goodsGroups.find(n => n.id == record.parent_id).children.findIndex(n => n.uid == record.uid) == goodsGroups.find(n => n.id == record.parent_id).children.length - 1) ? 'none' : 'inline-block' }}>下移</a>
              </div>
            ) : (
              <div>
                {/* 子分类隐藏添加 */}
                <a onClick={this.handleModalCreate.bind(null, 'entryCreate', record)} style={{ visibility: record.uid ? 'hidden' : 'none' }}>添加</a>
                {/* 子分类隐藏分割线 */}
                <Divider type="vertical" style={{ visibility: record.uid ? 'hidden' : 'none' }} />
                <a onClick={this.handleModalEdit.bind(null, record, record.uid ? 'entryEdit' : 'groupEdit')}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm onConfirm={this.handleDeleteSingle.bind(null, record)} title={`${record.uid ? '确认删除此子分组' : '确认删除此商品分组'}`}><a >删除</a></Popconfirm>
              </div>
            )
          }
        </div>
      ),
    }];

    return (
      <PageHeaderLayout breadcrumbList={breadCrumbList(this.props.history.location.pathname)} action={action} className={styles.actionExtra}>
        <Card>
          <Table dataSource={goodsGroups} columns={columns} rowKey="id" pagination={false} />
        </Card>
        <GoodsGroupModal type={modalType} visible={modalVisibel} formValue={formValue} onOk={this.handleModalOk} onCancel={this.handleModalCancel} sortGroupLength={goodsGroups.length} parentItem={parentItem} />
      </PageHeaderLayout>
    );
  }
}