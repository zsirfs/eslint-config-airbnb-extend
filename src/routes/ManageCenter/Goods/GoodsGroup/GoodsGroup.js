import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux,Link } from 'dva/router';
import { Row, Col, Card, Button, message, Table,Icon,Popconfirm,Divider} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import GoodsGroupModal from './Modal'
import styles from './GoodsGroup.less'
@connect(state => ({
  goodsGroup:state.goodsGroup,
}))
export default class GoodsGroup extends PureComponent {

  state = {
    modalVisibel: false,
    modalType: '',
    formValue: {},
    parentItem:{},
  }

  componentDidMount(){
    this.props.dispatch({type:'goodsGroup/getList'})
  }

  handleModalCreate = (key,item) => {
    this.setState({
      modalVisibel: true,
      modalType: key,
      formValue: {},
      parentItem: item
    })
  }

  handleModalCancel = () => {
    this.setState({
      modalVisibel: false
    })
  }

  handleModalEdit = (item,key) => {
    this.setState({
      modalVisibel: true,
      modalType: key,
      formValue: item,
    })
  }

  handleModalOk = (value) => {
    this.setState({
      modalVisibel: false
    })
    this.props.dispatch({type:`goodsGroup/${ this.state.modalType.indexOf('Create') > -1 ? 'createSingle' : 'editSingle'}`,payload:value}).then(()=>{
      this.props.dispatch({type:'goodsGroup/getList'})
    })
  }

  handleDeleteSingle = (item) => {
    this.props.dispatch({type:`goodsGroup/deleteSingle`,payload:{
      id: item.uid ? item.uid : item.id
    }}).then(()=>{
      this.props.dispatch({type:'goodsGroup/getList'})
    })
  }

  render() {
    const {goodsGroups} = this.props.goodsGroup;
    const {modalVisibel,modalType,formValue,parentItem} = this.state;
    const action = (
      <div>
        <Button>自定义排序</Button>
        <Button type='primary' onClick={this.handleModalCreate.bind(null,'groupCreate')}>新建商品分组</Button>
      </div>
    )

    const columns = [{
      title:'名称',
      dataIndex:'name'
    },{
      title:'操作',
      dataIndex:'operation',
      width:172,
      render:(text,record) => (
        <div>
          <a onClick={this.handleModalCreate.bind(null,'entryCreate',record)} style={{visibility: record.uid ? 'hidden' : 'none'}}>添加</a>
          <Divider  type='vertical' style={{visibility: record.uid ? 'hidden' : 'none'}}/>
          <a onClick={this.handleModalEdit.bind(null,record, record.uid ? 'entryEdit' : 'groupEdit')}>编辑</a>
          <Divider  type='vertical' />
          <Popconfirm onConfirm={this.handleDeleteSingle.bind(null,record)} title={`${record.uid ? '确认删除此子分组' : '确认删除此商品分组'}`}><a >删除</a></Popconfirm>
        </div>
      )
    }]

    return (
      <PageHeaderLayout action={action} className={styles.actionExtra}>
        <Card>
          <Table dataSource={goodsGroups} columns={columns} rowKey='id' pagination={false}/>
        </Card>
        <GoodsGroupModal type={modalType} visible={modalVisibel} formValue={formValue} onOk={this.handleModalOk} onCancel={this.handleModalCancel} sortGroupLength={goodsGroups.length}  parentItem={parentItem}/>
      </PageHeaderLayout>
    );
  }
}
