import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux,Link } from 'dva/router';
import currency from 'currency.js'
import { Row, Col, Card, Button,Icon,Table} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import styles from './SupplierDetail.less'
const NCNF = value => currency(value, { symbol: "", precision: 2 });
const NCNI = value => currency(value, { symbol: "", precision: 0});
@connect(state => ({
  supplierGoodsPurchaseDetail: state.supplierGoodsPurchaseDetail
}))
export default class GoodsPurchaseDetail extends PureComponent {

  handleSort = (pagination, filters, sorter) => {
    let sorts = {}
    if(sorter.field) {
      sorts[sorter.field] = sorter.order.slice(0,sorter.order.length-3)
    }else {
      sorts = {
        last_purchase_time:'desc'
      }
    }
    this.props.dispatch({type:'supplierGoodsPurchaseDetail/getList',payload:{
      id:this.props.supplierGoodsPurchaseDetail.customerId,
      subId:this.props.supplierGoodsPurchaseDetail.itemId,
      sorts:sorts,
    }})
  }

  render() {

    const {goodsPurchaseList,customerId} = this.props.supplierGoodsPurchaseDetail

    const columns = [{
      title: '名称',
      dataIndex: 'name',
    },{
      title: '购买量',
      dataIndex: 'total_quantity ',
      className: styles['numberRightMove'],
      sorter:true,
      render: (text,record) => NCNI(record.total_quantity ).format(true)
    },{
      title: '购买额',
      dataIndex: 'total_fee',
      className: styles['numberRightMove'],
      sorter:true,
      render: (text,record) => NCNF(record.total_fee).format(true)
    },{
      title: '最后购买时间',
      dataIndex: 'last_purchase_time',
      sorter:true,
    },{
      title: '操作',
      dataIndex: 'operation',
      render: (text,record) => (
        record.name ? (
          record.children ? (
            ((record.id).toString()).indexOf('_') > -1 ? <Link to={`/relationship/supplier-detail/skus-purchase-detail/${customerId}/${record.skuId}`}>查看</Link> : null
          ) :  <Link to={`/relationship/supplier-detail/skus-purchase-detail/${customerId}/${record.skuId}`}>查看</Link>
        ) : null
      )
    }]

    return (
      <PageHeaderLayout
      >
        <Card bordered={false}>
          <Table columns={columns}  dataSource={goodsPurchaseList} onChange={this.handleSort} rowKey="id" pagination={false}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}