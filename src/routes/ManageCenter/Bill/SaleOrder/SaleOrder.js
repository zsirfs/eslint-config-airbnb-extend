import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux,Link } from 'dva/router';
import { Row, Col, Card, Button, message, Table,Icon,Popconfirm,Divider,Switch} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import breadCrumbList from '../../../../common/breadCrumbList'
import AdjustPriceModal from './AdjustPriceModal'
import SaleLabelModal from './SaleLabelModal'
import styles from './SaleOrder.less'
const tabList = [{
  key:'adjust_price',
  tab:'调价方式'  
},{
  key:'default_deliver_way',
  tab:'默认发货方式',
},{
  key:'default_price',
  tab:'默认价格'
},{
  key:'sale_label',
  tab:'销售单标签'
}]
@connect(state => ({
  adjustPrice:state.adjustPrice,
  configSetting:state.configSetting,
  label:state.label,
}))
export default class SaleOrder extends PureComponent {

  state = {
    activeTabKey:'adjust_price',
    modalAdjustPriceVisibel: false,
    modalAdjustPriceType: '',
    formAdjustPriceValue: {},
    modalLabelVisibel: false,
    formLabelValue: {},
    isSort:false
  }

  componentDidMount(){
    this.props.dispatch({type:'adjustPrice/getList'})
    this.props.dispatch({type:'label/getSaleOrderLabel'})
  }

  handleModalAdjustPriceCreate = () => {
    this.setState({
      modalAdjustPriceVisibel: true,
      modalAdjustPriceType: 'create',
      formAdjustPriceValue: {}
    })
  }

  handleModalAdjustPriceCancel = () => {
    this.setState({
      modalAdjustPriceVisibel: false
    })
  }

  handleModalAdjustPriceEdit = (item) => {
    this.setState({
      modalAdjustPriceVisibel: true,
      modalAdjustPriceType: 'edit',
      formAdjustPriceValue: item
    })
  }

  handleModaAdjustPricelOk = (value) => {
    if(value.adjustPrice == '1') {
      value.value = 0;
      value.percent = 1;
      value.percent_method = 1;
    }else if(value.adjustPrice == '2') {
      value.value = 0 ;
      value.percent = 1;
      value.percent_method = 0;
    }else if(value.adjustPrice == '3') {
      value.value = 1;
      value.percent = 0;
      value.percent_method = 0;
    }
    delete value.adjustPrice
    this.setState({
      modalAdjustPriceVisibel:false,
    })
    this.props.dispatch({type:`adjustPrice/${value.id ? 'editSingle' : 'createSingle'}`,payload:value}).then(()=>{
      this.props.dispatch({type:'adjustPrice/getList'})
    })
  }

  handleDeleteSingle = (item) => {
    this.props.dispatch({type:'adjustPrice/deleteSingle',payload:{
      id:item.id
    }}).then(()=>{
      this.props.dispatch({type:'adjustPrice/getList'})
    })
  }

  handleLabelModalOpen = (item) => {
    this.setState({
      modalLabelVisibel: true,
      formLabelValue: item
    })
  }

  handleLabelModalCancel = () => {
    this.setState({
      modalLabelVisibel: false
    })
  }

  handleLabelModalOk = (value) => {
    this.setState({
      modalLabelVisibel:false,
    })
    this.props.dispatch({type:'label/editSaleOrderLabel',payload:value}).then(()=>{
      this.props.dispatch({type:'label/getSaleOrderLabel'})
    })
  }

  handleTabChange = (key) => {
    this.setState({
      activeTabKey:key
    })
  }

  handleSwitchDefaultDeliverWay = (key) => {
    this.props.dispatch({type:'configSetting/switchDefaultDeleiverWay',payload:key}).then(()=>{
      this.props.dispatch({type:'configSetting/getConfigSetting'})
    })
  }

  handleSwitchDefaultPrice = (key) => {
    if(key == 1) {
      this.props.dispatch({type:'configSetting/switchUsePrice',payload:'no'}).then(()=>{
        this.props.dispatch({type:'configSetting/switchHistoryPrice',payload:'no'}).then(()=>{
          this.props.dispatch({type:'configSetting/getConfigSetting'})
        })
      })
    }else if(key == 2) {
      this.props.dispatch({type:'configSetting/switchUsePrice',payload:'yes'}).then(()=>{
        this.props.dispatch({type:'configSetting/switchHistoryPrice',payload:'no'}).then(()=>{
          this.props.dispatch({type:'configSetting/getConfigSetting'})
        })
      })
    }else if(key == 3) {
      this.props.dispatch({type:'configSetting/switchHistoryPrice',payload:'yes'}).then(()=>{
        this.props.dispatch({type:'configSetting/getConfigSetting'})
      })
    }
  }

  handleSortStart = () => {
    this.setState({
      isSort:true
    })
  }

  handleSortCancel = () => {
    this.setState({
      isSort:false
    })
    this.props.dispatch({type:'adjustPrice/getList'})
  }

  handleSortMove = (id,moveWay) => {
    this.props.dispatch({type:'adjustPrice/setSortMove',payload:{
      currentId:id,
      moveWay:moveWay,
    }})
  }

  handleSortOk = () => {
    this.props.dispatch({type:'adjustPrice/editSort',payload:this.props.adjustPrice.adjustPrices}).then(()=>{
      this.handleSortCancel()
    })
  }

  render() {
    const {adjustPrices} = this.props.adjustPrice;
    const {defaultDeliveryWay,usePricelelvel,useHistoryPrice} = this.props.configSetting;
    const { saleLabels} = this.props.label
    const {modalAdjustPriceVisibel,modalAdjustPriceType,formAdjustPriceValue,activeTabKey,modalLabelVisibel,formLabelValue,isSort} = this.state;

    const action = (
      <div>
        {
          isSort ? (
            <div>
              <Popconfirm title='确认取消自定义排序' onConfirm={this.handleSortCancel}>
                <Button style={{marginRight:10}}>取消</Button>
              </Popconfirm>
              <Button type='primary' onClick={this.handleSortOk}>确认</Button>
            </div>
          ) : (
            <div>
              <Button style={{marginRight:10}} onClick={this.handleSortStart}>自定义排序</Button>
              <Button type='primary' onClick={this.handleModalAdjustPriceCreate}>新建调价方式</Button>
            </div>
          )
        }
      </div>
    )

    const adjustPriceColumns = [{
      title:'名称',
      dataIndex:'name'
    },{
      title:'调价',
      dataIndex:'adjustprice',
      render:(text,record) => (
        record.value == 1 ? '减价' : (
          record.percent == 1 ? (
            record.percent_method == 1 ? '折' : '百分比'
          ) : '-'
        ) 
      )
    },{
      title:'操作',
      dataIndex:'operation',
      width:172,
      render:(text,record) => (
        <div>
          <a onClick={this.handleModalAdjustPriceEdit.bind(null,record)}>编辑</a>
          <Divider  type='vertical' />
          <Popconfirm onConfirm={this.handleDeleteSingle.bind(null,record)} title='确认删除此调价方式'><a >删除</a></Popconfirm>
        </div>
      )
    }]

    const sortAdjustPriceColumns = [{
      title:'名称',
      dataIndex:'name'
    },{
      title:'操作',
      dataIndex:'operation',
      width:172,
      render:(text,record) => (
        <div>
          <a onClick={this.handleSortMove.bind(null,record.id,'up')} style={{display: adjustPrices.findIndex( n => n.id == record.id) == 0 ? 'none' : 'inline-block'}}>上移</a>
          <Divider  type='vertical' style={{display: (adjustPrices.findIndex( n => n.id == record.id) == 0 || adjustPrices.findIndex( n => n.id == record.id) == adjustPrices.length -1) ? 'none' : 'inline-block'}}/>
          <a onClick={this.handleSortMove.bind(null,record.id,'down')} style={{display: adjustPrices.findIndex( n => n.id == record.id) == adjustPrices.length - 1 ? 'none' : 'inline-block'}}>下移</a>
        </div>
      )
    }]

    const saleLabelColumns = [{
      title:' ',
      dataIndex:'adjustPrice',
      width:30,
      render:(text,record) => <div style={{width:24,height:24,borderRadius:12,background:`#${record.adjustPrice}`}}></div>
    },{
      title:'名称',
      dataIndex:'name'
    },{
      title:'操作',
      dataIndex:'operation',
      width:172,
      render:(text,record) => <a onClick={this.handleLabelModalOpen.bind(null,record)}>编辑</a>
    }]

    return (
      <PageHeaderLayout breadcrumbList={breadCrumbList(this.props.history.location.pathname)} tabList={tabList} activeTabKey={activeTabKey} onTabChange={this.handleTabChange}>
        <div style={{display: activeTabKey == 'adjust_price' ? 'block' : 'none'}}>
          <Card title='调价方式列表' extra={action}>
            <Table dataSource={adjustPrices} columns={ isSort ? sortAdjustPriceColumns : adjustPriceColumns} rowKey='id' pagination={false}/>
          </Card>
        </div>
        <div style={{display: activeTabKey == 'default_deliver_way' ? 'block' : 'none'}}>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>现场自提</span><Switch onClick={this.handleSwitchDefaultDeliverWay.bind(null,1)} checked={defaultDeliveryWay == 1} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
          <Divider style={{margin:0,width:0}}/>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>稍后自提</span><Switch onClick={this.handleSwitchDefaultDeliverWay.bind(null,2)} checked={defaultDeliveryWay == 2} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
          <Divider style={{margin:0,width:0}}/>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>稍后拼包</span><Switch onClick={this.handleSwitchDefaultDeliverWay.bind(null,3)} checked={defaultDeliveryWay == 3} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
          <Divider style={{margin:0,width:0}}/>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>物流运输</span><Switch onClick={this.handleSwitchDefaultDeliverWay.bind(null,4)} checked={defaultDeliveryWay == 4} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
        </div>
        <div style={{display: activeTabKey == 'default_price' ? 'block' : 'none'}}>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>标准价</span><Switch onClick={this.handleSwitchDefaultPrice.bind(null,1)} checked={usePricelelvel == 'no' && useHistoryPrice == 'no'} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
          <Divider style={{margin:0,width:0}}/>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>客户价</span><Switch onClick={this.handleSwitchDefaultPrice.bind(null,2)} checked={usePricelelvel == 'yes' && useHistoryPrice == 'no'} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
          <Divider style={{margin:0,width:0}}/>
          <Card bordered={false}>
            <div><span className={styles.spanTitle}>历史购买价</span><Switch onClick={this.handleSwitchDefaultPrice.bind(null,3)} checked={ useHistoryPrice == 'yes'} className={styles.switchPosition} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/></div>
          </Card>
        </div>
        <div style={{display: activeTabKey == 'sale_label' ? 'block' : 'none'}}>
          <Card bordered={false}>
            <Table dataSource={saleLabels} columns={saleLabelColumns} rowKey='id' pagination={false}/>
          </Card>
        </div>
        <SaleLabelModal visible={modalLabelVisibel} formValue={formLabelValue} onOk={this.handleLabelModalOk} onCancel={this.handleLabelModalCancel} />
        <AdjustPriceModal type={modalAdjustPriceType} visible={modalAdjustPriceVisibel} formValue={formAdjustPriceValue} onOk={this.handleModaAdjustPricelOk} onCancel={this.handleModalAdjustPriceCancel} sortLength={adjustPrices.length}/>
      </PageHeaderLayout>
    );
  }
}