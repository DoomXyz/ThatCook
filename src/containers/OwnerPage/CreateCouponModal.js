import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { closeOutline, disc } from 'ionicons/icons';

import './CreateCouponModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleGetAllCodesApi } from '../../services/utilitiesServices';

class CreateCouponModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            couponcode: '',
            coupondescription: '',
            minordervalue: 0,
            discountvalue: 0,
            maxdiscount: 0,
            startdate: null,
            enddate: null,
            discounttype: '',
            codeDiscountType: [],
        };
        this.debounceTimeout = null;
    }

    async componentDidMount() {
        // await Promise.all([this.handleLoadCodeProductType(), this.handleLoadCodePetType(), this.handleLoadCodeBannerStatus()]);
        await this.handleLoadCodeDiscountType();
    }

    async componentDidUpdate(prevProps) {
        const { isOpen } = this.props;
        if (isOpen && !prevProps.isOpen) {
            this.resetState();
            await this.handleLoadCodeDiscountType();
        }
    }

    componentWillUnmount() {
        if (this.state.imagePreview) {
            URL.revokeObjectURL(this.state.imagePreview);
        }
    }

    resetState = () => {
        this.setState({
            couponcode: '',
            coupondescription: '',
            minordervalue: '',
            discountvalue: '',
            maxdiscount: '',
            codeDiscountType: this.state.codeDiscountType,
            startdate: null,
            enddate: null,
            discounttype: '',
        });
    };

    handleLoadCodeDiscountType = async () => {
        try {
            const codeDiscountType = await handleGetAllCodesApi('DiscountType');
            if (!codeDiscountType || codeDiscountType.length === 0) {
                toast.error('Không thể tải danh sách loại giảm giá!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
            }
            this.setState({
                codeDiscountType,
                discounttype: codeDiscountType.length > 0 ? codeDiscountType[0].Code : '',
            });
        } catch (e) {
            console.error('Error loading discount type code:', e);
            toast.error('Lỗi khi tải danh sách loại giảm giá!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
        }
    };

    handleSelectChange = (e, field) => {
        this.setState({ [field]: e.target.value }, () => { });
    };
    handleInputChange = (e, field) => {
        this.setState({ [field]: e.target.value });
    };

    checkValidateInput = () => {
        const { couponcode, minordervalue, discountvalue, maxdiscount, startdate, enddate, discounttype } = this.state;
        if (!couponcode) {
            return { errCode: -1, errMessage: 'Vui lòng nhập mã giảm giá!' };
        } else {
            const couponCodeRegex = /^[a-zA-Z0-9]{5,20}$/;
            if (!couponCodeRegex.test(couponcode.trim())) {
                return { errCode: 1, errMessage: 'Mã giảm giá không hợp lệ hoặc vượt quá giới hạn ký tự!' };
            }
        }
        if (!discountvalue) {
            return { errCode: -1, errMessage: 'Giá trị giảm không được để trống!' };
        } else {
            if (discounttype === 'PERC') {
                if (discountvalue > 100) {
                    return { errCode: 1, errMessage: 'Giá trị giảm không hợp lệ!' };
                } else if (discountvalue < 0) {
                    return { errCode: 1, errMessage: 'Giá trị giảm không hợp lệ!' };
                }
            }
        }
        if (!maxdiscount) {
            return { errCode: -1, errMessage: 'Gỉảm giá tối đa không được để trống!' };
        }
        if (!startdate) {
            return { errCode: -1, errMessage: 'Ngày bắt đầu không được để trống!' };
        }

        if (enddate) {
            const startCheck = new Date(startdate);
            const dateCheck = new Date(enddate);
            if (isNaN(dateCheck.getTime())) return { errCode: 1, errMessage: 'Ngày hết hiệu lực không hợp lệ!' };
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const starttime = `${hours}:${minutes}`;
            const [hoursCheck, minutesCheck] = starttime.split(':').map(Number);
            dateCheck.setHours(hoursCheck, minutesCheck, 0, 0);
            startCheck.setHours(hoursCheck, minutesCheck, 0, 0);
            if (dateCheck < now) return { errCode: 1, errMessage: 'Ngày hết hiệu lực phải trong tương lai' };
            if (dateCheck < startCheck) return { errCode: 1, errMessage: 'Thời gian hết hiệu lực phải lớn hơn thời gian quá khứ' };
        }
        if (!discounttype) {
            return { errCode: -1, errMessage: 'Loại giảm giá chưa được chọn!' };
        }
        return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
    };

    handleCreateCoupon = async () => {
        const validation = this.checkValidateInput();
        if (validation.errCode !== 0) {
            toast.error(validation.errMessage, {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
            return;
        }

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
                    { position: 'top-center', autoClose: 1000, closeOnClick: false }
                );
            });

        const isConfirmed = await confirmSave();
        if (!isConfirmed) return;
        try {
            const { couponcode, coupondescription, minordervalue, discountvalue, maxdiscount, startdate, enddate, discounttype } = this.state;
            const isValidateInput = this.checkValidateInput();
            if (isValidateInput.errCode !== 0) {
                toast.error(isValidateInput.errMessage, {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
                return;
            }

            const couponInfo = {
                couponcode,
                coupondescription,
                minordervalue,
                discountvalue,
                maxdiscount,
                startdate: startdate ? startdate.toISOString().split('T')[0] : null,
                enddate: enddate ? enddate.toISOString().split('T')[0] : null,
                discounttype,
            };

            await this.props.handleCreateCouponFromModal(couponInfo);
        } catch (e) {
            console.error('Lỗi khi tạo coupon:', e);
            toast.error('Lỗi khi tạo coupon!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
        }
    };

    toggle = () => {
        this.props.toggleFromModal();
    };

    render() {
        const { couponcode, coupondescription, minordervalue, discountvalue, maxdiscount, codeDiscountType, startdate, enddate, discounttype } = this.state;

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
                                <input type="text" placeholder="Nhập mã giảm giá" value={couponcode} onChange={(e) => this.handleInputChange(e, 'couponcode')} />
                            </div>
                            <div className="modal-content-add-discount-type">
                                <p>Loại giảm giá:</p>
                                <select value={discounttype} onChange={(e) => this.handleSelectChange(e, 'discounttype')}>
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
                                        value={discountvalue}
                                        onChange={(e) => this.handleInputChange(e, 'discountvalue')}
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
                                    value={maxdiscount}
                                    onChange={(e) => this.handleInputChange(e, 'maxdiscount')}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    }}
                                />
                            </div>
                        </div>
                        <div className="f">
                            <div className="modal-content-add-coupon-description">
                                <p>Mô tả: </p>
                                <input type="text" placeholder="Nhập mô tảaa" value={coupondescription} onChange={(e) => this.handleInputChange(e, 'coupondescription')} />
                            </div>
                            <div className="modal-content-add-min-value">
                                <p>Mua tối thiểu: </p>
                                <input
                                    type="text"
                                    placeholder="Nhập giá mua ít nhất"
                                    value={minordervalue}
                                    onChange={(e) => this.handleInputChange(e, 'minordervalue')}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    }}
                                />
                            </div>
                        </div>

                        <div className="modal-content-add-dates f">
                            <div className="modal-content-add-dates-start-date">
                                <p>Ngày bắt đầu:</p>
                                <DatePicker selected={startdate} onChange={(date) => this.setState({ startdate: date })} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" isClearable />
                            </div>
                            <div className="modal-content-add-dates-end-date">
                                <p>Ngày hết hiệu lực:</p>
                                <DatePicker selected={enddate} onChange={(date) => this.setState({ enddate: date })} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" isClearable />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.toggle}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={this.handleCreateCoupon}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreateCouponModal;