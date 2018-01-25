import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux,Link } from 'dva/router';
import moment from 'moment';
import { Row, Col, Card, Button, Table,Icon,Select,Menu,Dropdown,Popconfirm,Divider,Form,DatePicker,Spin} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import StandardFormRow from '../../../../components/antd-pro/StandardFormRow';
import TagSelect from '../../../../components/DuokeTagSelect';
import styles from './CustomerList.less'
const Option = Select.Option;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const sortOptions = [{
  name:'创建时间降序',
  id:1,
  sorts: {
    created_at: 'desc'
  }
},{
  name:'创建时间升序',
  id:2,
  sorts: {
    created_at: 'asc'
  }
},{
  name:'更新时间降序',
  id:3,
  sorts: {
    updated_at: 'desc'
  }
},{
  name:'更新时间升序',
  id:4,
  sorts: {
    updated_at: 'asc'
  }
},{
  name:'交易笔数降序',
  id:5,
  sorts: {
    trade_count: 'desc'
  }
},{
  name:'交易笔数升序',
  id:6,
  sorts: {
    trade_count: 'asc'
  }
},{
  name:'交易金额降序',
  id:7,
  sorts: {
    trade_amount: 'desc'
  }
},{
  name:'交易金额升序',
  id:8,
  sorts: {
    trade_amount: 'asc'
  }
},{
  name:'欠款金额降序',
  id:9,
  sorts: {
    debt: 'desc'
  }
},{
  name:'欠款金额升序',
  id:10,
  sorts: {
    debt: 'asc'
  }
}]
@Form.create()
@connect(state => ({
  customerList:state.customerList,
  layoutFilter:state.layoutFilter
}))
export default class CustomerList extends PureComponent {

  state = {
    sorts: {
      created_at: 'desc'
    },
    pages: {
      per_page: 10,
      page: 1,
    },
    filter:{
      data_type:'custom',
      sday: moment(new Date((new Date).getTime() - 7*24*60*60*1000),'YYYY-MM-DD').format('YYYY-MM-DD'),
      eday: moment(new Date(),'YYYY-MM-DD').format('YYYY-MM-DD'),
    },
  }

  handleToCustomerCreate = () => {
    this.props.dispatch(routerRedux.push('/relationship/customer-create'))
  }

  handleDeleteSingleCustomer = (id) => {
    this.props.dispatch({type:'customerList/deleteSingle',payload:id}).then(()=>{
      this.handleGetList(this.state.filter,this.state.pages,this.state.sorts)
    })
  }

  handleChangeCustomerStatus = (id,status) => {
    this.props.dispatch({type:'customerList/changeCustomerStatus',payload:{
      id: id,
      freeze: status
    }}).then(()=>{
       this.handleGetList(this.state.filter,this.state.pages,this.state.sorts)
    })
  }

  handleGetList = ( filter,pages,sorts ) => {
    this.props.dispatch({type:'customerList/getList',payload:{
      ...filter,
      ...pages,
      sorts,
    }})
  }

  handleSelectSort = (value) => {
    let sorts = sortOptions.find( item => item.name == value.slice(6,value.length)).sorts;
    this.setState({sorts})
    this.handleGetList(this.state.filter,this.state.pages,sorts)
  }

  handleCustomerFormSubmit = () => {
    const { form, dispatch } = this.props;
    setTimeout(() => {
      form.validateFields((err,value) => {
        if(!err) {
          this.props.dispatch({type:'customerList/setFilterCustomerServerData',payload:{
            ...value,
            datePick: value['datePick'] ? [value['datePick'][0].format('YYYY-MM-DD'),value['datePick'][1].format('YYYY-MM-DD')] : undefined
          }})
          const filter = {...this.props.customerList.fifterCustomerServerData}
          const pages = {...this.state.pages,page:1}
          this.setState({filter,pages})
          this.handleGetList(filter,pages,this.state.sorts)
        }
      })
    }, 0)
  }

  handleMoreOperation = (item) => {
    return (
      <div>
        <Link to={`/relationship/customer-detail/${item.id}`}>查看</Link>
        <Divider type='vertical' />
        <Link to={`/relationship/customer-edit/${item.id}`}>编辑</Link>
        <Divider  type='vertical' />
        <Dropdown overlay={    
          <Menu>
            { item.freeze == 0 ? (
              <Menu.Item key="1"><Popconfirm title="确认冻结此客户?" onConfirm={this.handleChangeCustomerStatus.bind(null,item.id,1)}>冻结</Popconfirm></Menu.Item>
              ) : (
                <Menu.Item key="2"><Popconfirm title="确认解除冻结此客户?" onConfirm={this.handleChangeCustomerStatus.bind(null,item.id,0)}>解除冻结</Popconfirm></Menu.Item>
              )}
            <Menu.Item key="3"><Popconfirm title="确认删除此客户?" onConfirm={this.handleDeleteSingleCustomer.bind(null,item.id)}>删除</Popconfirm></Menu.Item>
          </Menu>
        }>
        <a className="ant-dropdown-link">更多<Icon type="down" /></a>
        </Dropdown>
      </div>
    )
  }

  handleHeaderExtra = () => {
    return (
      <Button type='primary' onClick={this.handleToCustomerCreate}>新建客户</Button>
    )
  }

  handleTableSortExtra = () => {
    return (
      <Select style={{ width: 200 }}  defaultValue={'排序方式: 创建时间降序'} onChange={this.handleSelectSort} optionLabelProp='value'>
        {
          sortOptions.map( item => {
            return <Option key={item.id} value={`排序方式: ${item.name}`}>{item.name}</Option>
          })
        }
      </Select>
    )
  }

  render() {
    const {customerList: {customerList,customerPagination} , layoutFilter: {customerFilter} , form: {getFieldDecorator}} = this.props;
    const {sorts,pages,filter} = this.state;

    const columns = [{
      title: '姓名',
      dataIndex: 'name',
    }, {
      title: '交易笔数',
      dataIndex: 'trade_count',
    }, {
      title: '交易金额',
      dataIndex: 'trade_amount',
    }, {
      title: '欠款金额',
      dataIndex: 'debt',
    }, {
      title: '操作',
      dataIndex: 'operation',
      width:'162px', 
      render: (text,record,index) =>( this.handleMoreOperation(record) )
    }];

    const pagination = {
      pageSize:pages.per_page,
      current:pages.page,
      total:customerPagination.total,
      showQuickJumper:true,
      showSizeChanger:true,
      onChange:( page,pageSize ) => {
        const pages = {
          per_page:pageSize,
          page:page
        }
        this.setState({pages})
        this.handleGetList(filter,pages,sorts)
      },
      onShowSizeChange: ( current,size) => {
        const pages = {
          per_page:size,
          page:1
        }
        this.setState({pages})
        this.handleGetList(filter,pages,sorts)
      }
    }

    return (
      <PageHeaderLayout
        extraContent={this.handleHeaderExtra()}
        className={styles.customerListExtra}
        >
        <Spin size='large' spinning = {!customerList.length}>
          <Card bordered={false} className={styles.bottomCardDivided}>
            <Form layout='inline'>
              {
                customerFilter.map( (item,index) => {
                  return (
                    <StandardFormRow key={`${index}`} title={`${item.name}`} block>
                      <FormItem>
                        {getFieldDecorator(`${item.code}`)(
                          <TagSelect expandable onChange={this.handleCustomerFormSubmit}>
                            {
                              item.options.map( (subItem,subIndex) => {
                                return <TagSelect.Option key={`${subIndex}`} value={`${subItem.value}`}>{subItem.name}</TagSelect.Option>
                              })
                            }
                          </TagSelect>
                        )}
                      </FormItem>
                    </StandardFormRow>
                  )
                })
              }
              <FormItem label='选择日期' >
                {getFieldDecorator('datePick',{
                  initialValue:[moment(new Date((new Date).getTime() - 7*24*60*60*1000),'YYYY-MM-DD'),moment(new Date(),'YYYY-MM-DD')]
                })(
                  <RangePicker style={{width:542}} onChange={this.handleCustomerFormSubmit}/>
                )}
              </FormItem>
            </Form>
          </Card>
          <Card bordered={false} title='客户列表' extra={this.handleTableSortExtra()}>
            <Table 
              rowKey='id'
              columns={columns} 
              dataSource={customerList} 
              pagination={pagination}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}