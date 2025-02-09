"use client"
import '@ant-design/v5-patch-for-react-19';
import React, { useState, useEffect } from 'react';
import { Input, Checkbox, Button, Table, Row, Col, Tag, DatePicker, message, Typography, Space, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const NewsList = () => {
    const [news, setNews] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showFocus, setShowFocus] = useState(false);
    const [dateRange, setDateRange] = useState([null, dayjs().endOf('day')]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(70);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchNews({
            keyword: searchKeyword,
            startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
            isFinanceOrEstate: showFocus
        });
    }, [currentPage, pageSize]);

    const fetchNews = async (params = {}) => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8001/api/v1/news', {
                params: {
                    ...params,
                    page: currentPage,
                    pageSize: pageSize
                }
            });
            setNews(response.data.items);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching news:', error);
            message.error('获取新闻列表失败');
        }
        setLoading(false);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        const params = {
            keyword: searchKeyword,
            startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
            isFinanceOrEstate: showFocus
        };
        fetchNews(params);
    };

    const resetSearch = () => {
        setSearchKeyword('');
        setShowFocus(false);
        setDateRange([null, dayjs().endOf('day')]);
        setCurrentPage(1);
        fetchNews();
    };


    interface NewsItem {
        id: string | number;
        title: string;
        url: string;
        isFinanceOrEstate: boolean;
        summary: string;
        tags: string;
        editor_time: string;
    }

    const columns: ColumnsType<NewsItem> = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: NewsItem) => (
                <a
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1890ff', textDecoration: 'none' }}
                >
                    {record.isFinanceOrEstate && <span style={{marginRight: 8}}>👍</span>}
                    {text}
                </a>
            ),
        },
        {
            title: '文章摘要',
            dataIndex: 'summary',
            key: 'summary',
            render: (text: string) => (
                <Tooltip
                    title={text || '暂无摘要'}
                    placement="topLeft"
                    styles={{ root: { maxWidth: '400px' } }}
                >
                    <div style={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}>
                        {text || '暂无摘要'}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string) => {
                const tagArray = tags ? tags.split(',') : [];
                return (
                    <>
                        {tagArray.map(tag => (
                            <Tag color="blue" key={tag.trim()}>
                                {tag.trim()}
                            </Tag>
                        ))}
                    </>
                );
            },
        },
        {
            title: '发布时间',
            dataIndex: 'editor_time',
            key: 'editor_time',
        },
    ];

    return (
        <div style={{
            padding: '24px 16px',
            maxWidth: '1600px',
            margin: '0 auto',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <Title
                level={2}
                style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    color: '#1d1d1d',
                    fontSize: '28px',
                    fontWeight: 600
                }}
            >
                北方网-都市新闻
            </Title>

            <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '32px'
            }}>
                <Row
                    gutter={[24, 16]}
                    align="middle"
                    wrap={true}
                >
                    <Col xs={24} md={8} lg={6}>
                        <Input
                            placeholder="搜索标题关键字"
                            prefix={<SearchOutlined/>}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                            size="large"
                        />
                    </Col>

                    <Col xs={24} md={16} lg={8}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            style={{width: '100%'}}
                            size="large"
                            presets={[
                                {label: '今天', value: [dayjs(), dayjs()]},
                                {label: '本周', value: [dayjs().startOf('week'), dayjs().endOf('week')]},
                                {label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')]},
                            ]}
                        />
                    </Col>

                    <Col flex="none">
                        <Checkbox
                            checked={showFocus}
                            onChange={(e) => setShowFocus(e.target.checked)}
                            style={{lineHeight: '32px'}}
                        >
                            <span style={{fontWeight: 500}}>只看金融/地产</span>
                        </Checkbox>
                    </Col>

                    <Col flex="auto">
                        <Space style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                type="primary"
                                icon={<SearchOutlined/>}
                                onClick={handleSearch}
                                size="large"
                                style={{minWidth: '100px'}}
                                loading={loading}
                            >
                                搜索
                            </Button>
                            <Button
                                onClick={resetSearch}
                                icon={<ReloadOutlined/>}
                                size="large"
                                style={{minWidth: '100px'}}
                            >
                                重置
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            <div style={{
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Table
                    columns={columns}
                    dataSource={news}
                    rowKey="id"
                    loading={loading}
                    scroll={{x: true}}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        onChange: (page, pageSize) => {
                            setCurrentPage(page);
                            setPageSize(pageSize);
                            fetchNews({
                                keyword: searchKeyword,
                                startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
                                endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
                                isFinanceOrEstate: showFocus
                            });
                        },
                        onShowSizeChange: (current, size) => {
                            setPageSize(size);
                        }
                    }}
                    rowClassName={(record, index) =>
                        index % 2 === 0 ? 'even-row' : 'odd-row'
                    }
                />
            </div>
        </div>
    );
};

export default NewsList;