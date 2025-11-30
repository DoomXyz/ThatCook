import React, { Component } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';

import './CreateCouponModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { getAllCodes, validateCouponInput } from '../../utils/pakage';

class CreateCouponModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            CouponCode: '',
            CouponDescription: '',
            MinOrderValue: 0,
            DiscountValue: 0,
            MaxDiscount: 0,
            StartDate: null,
            EndDate: null,
            DiscountType: '',
            codeDiscountType: [],
            disabledButtons: {
                createCoupon: false,
            },
        };
        this.debounceTimeout = null;
    }
    async componentDidMount() {
        await this.handleLoadCode(['DiscountType']);
    }
    async componentDidUpdate(prevProps) {
        const { isOpen } = this.props;
        if (isOpen && !prevProps.isOpen) {
            this.resetState();
        }
    }
    handleLoadCode = async (codeTypes) => {
        try {
            const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
            const newState = { isLoading: false };
            const hasDefault = ['DiscountType'];
            codeTypes.forEach((type, index) => {
                const response = responses[index];
                if (!response.status || response.data.length === 0) {
                    toast.error(`Không thể tải danh sách ${type}!`);
                }
                newState[`code${type}`] = response.data;
                if (hasDefault.includes(type)) {
                    newState[type] = response.data.length > 0 ? response.data[0].Code : '';
                }
            });
            this.setState(newState);
        } catch (error) {
            console.error('Error loading codes:', error);
            toast.error('Lỗi khi tải dữ liệu!');
            this.setState({ isLoading: false });
        }
    };
    resetState = () => {
        const { codeDiscountType } = this.state
        this.setState({
            CouponCode: '',
            CouponDescription: '',
            MinOrderValue: '',
            DiscountValue: '',
            MaxDiscount: '',
            StartDate: null,
            EndDate: null,
            DiscountType: codeDiscountType.length > 0 ? codeDiscountType[0].Code : '',
        });
    };
    toggle = () => {
        this.resetState();
        this.props.toggleFromModal();
    };
    handleInputChange = (e, field) => {
        this.setState({ [field]: e.target.value });
    };
    handleCreateCoupon = async () => {
        const { CouponCode, CouponDescription, MinOrderValue, DiscountValue, MaxDiscount, StartDate, EndDate, DiscountType } = this.state;
        const couponInfo = {
            CouponCode,
            CouponDescription,
            MinOrderValue: MinOrderValue ? parseFloat(MinOrderValue) : 0,
            DiscountValue: parseFloat(DiscountValue),
            MaxDiscount: MaxDiscount ? parseFloat(MaxDiscount) : undefined,
            DiscountType,
            StartDate: StartDate ? StartDate.toISOString().split('T')[0] : null,
            EndDate: EndDate ? EndDate.toISOString().split('T')[0] : null,
            CouponStatus: "ACTIVE"
        };
        const isValidateInput = await validateCouponInput(couponInfo);
        if (!isValidateInput.valid) {
            toast.error(isValidateInput.errMessage);
            return;
        }
        this.setState({ disabledButtons: { ...this.state.disabledButtons, createCoupon: false } });
        const confirmSave = () =>
            new Promise((resolve) => {
                toast(
                    <div>
                        <p>Xác nhận tạo coupon mới?</p>
                        <button
                            className="toast-confirm-btn"
                            onClick={() => {
                                resolve(true);
                                toast.dismiss();
                            }}
                        >
                            Có
                        </button>
                        <button
                            className="toast-cancel-btn"
                            onClick={() => {
                                resolve(false);
                                toast.dismiss();
                            }}
                        >
                            Không
                        </button>
                    </div>,
                    {
                        autoClose: 2000,
                        closeOnClick: false,
                        onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, createCoupon: false } }); },
                    }
                );
            });
        const isConfirmed = await confirmSave();
        if (!isConfirmed) return;
        try {
            await this.props.handleCreateCouponFromModal(couponInfo);
        } catch (e) {
            console.error('Lỗi khi tạo coupon:', e);
            toast.error('Lỗi khi tạo coupon!');
        }
    };
    render() {
        const { CouponCode, CouponDescription, MinOrderValue, DiscountValue, MaxDiscount, codeDiscountType, StartDate, EndDate, DiscountType, disabledButtons } = this.state;
        return (
            <Modal show={this.props.isOpen} onHide={this.toggle} centered backdrop="static" className="create-coupon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Mã Giảm Giá Mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="create-coupon-content">
                        <div className="f">
                            <div className="modal-content-add-coupon-code">
                                <p>Mã giảm giá: </p>
                                <input type="text" placeholder="Nhập mã giảm giá" value={CouponCode} onChange={(e) => this.handleInputChange(e, 'CouponCode')} />
                            </div>
                            <div className="modal-content-add-discount-type">
                                <p>Loại giảm giá:</p>
                                <select value={DiscountType} onChange={(e) => this.handleInputChange(e, 'DiscountType')}>
                                    {codeDiscountType.map((type) => (
                                        <option key={type.Code} value={type.Code}>
                                            {type.CodeValueVI}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="f">
                            <div className="modal-content-add-discount-value">
                                <p>Giá trị giảm: </p>
                                <div className="f">
                                    <input
                                        type="text"
                                        placeholder="Nhập giá trị giảm"
                                        value={DiscountValue}
                                        onChange={(e) => this.handleInputChange(e, 'DiscountValue')}
                                        onInput={(e) => {
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="modal-content-add-max-discount">
                                <p>Giảm tối đa: </p>
                                <input
                                    type="text"
                                    placeholder="Nhập giá giảm tối đa"
                                    value={MaxDiscount}
                                    onChange={(e) => this.handleInputChange(e, 'MaxDiscount')}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    }}
                                />
                            </div>
                        </div>
                        <div className="f">
                            <div className="modal-content-add-coupon-description">
                                <p>Mô tả: </p>
                                <input type="text" placeholder="Nhập mô tảaa" value={CouponDescription} onChange={(e) => this.handleInputChange(e, 'CouponDescription')} />
                            </div>
                            <div className="modal-content-add-min-value">
                                <p>Mua tối thiểu: </p>
                                <input
                                    type="text"
                                    placeholder="Nhập giá mua ít nhất"
                                    value={MinOrderValue}
                                    onChange={(e) => this.handleInputChange(e, 'MinOrderValue')}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    }}
                                />
                            </div>
                        </div>

                        <div className="modal-content-add-dates f">
                            <div className="modal-content-add-dates-start-date">
                                <p>Ngày bắt đầu:</p>
                                <DatePicker selected={StartDate} onChange={(date) => this.setState({ StartDate: date })} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" isClearable />
                            </div>
                            <div className="modal-content-add-dates-end-date">
                                <p>Ngày hết hiệu lực:</p>
                                <DatePicker selected={EndDate} onChange={(date) => this.setState({ EndDate: date })} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" isClearable />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.toggle}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={this.handleCreateCoupon} disabled={disabledButtons.createCoupon}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreateCouponModal;