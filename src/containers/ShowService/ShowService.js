import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import './ShowService.scss';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';
import { handleGetServiceInfoApi } from '../../services/serviceServices';
import { savePreselectInfo, selectServiceType } from '../../store/actions';
import genHealthImage from '../../assets/doctor-imgs/genheath.png';
import vaccinationImage from '../../assets/doctor-imgs/vaccination.jpg';
import surgeryImage from '../../assets/doctor-imgs/Phauthuat.jpg';
import testImage from '../../assets/doctor-imgs/xetnghiem.jpg';
import iconImage from '../../assets/doctor-imgs/icon.jpeg';

class ShowService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            loading: true,
        };
    }

    componentDidMount() {
        this.fetchServices();
    }

    fetchServices = async () => {
        try {
            this.setState({ loading: true });
            const response = await handleGetServiceInfoApi('ALL');
            if (response && response.data && response.data.errCode === 0) {
                this.setState({ services: response.data.data });
            } else {
                toast.error('Không thể tải danh sách dịch vụ!');
            }
        } catch (error) {
            console.error('Lỗi khi lấy dịch vụ:', error);
            toast.error('Lỗi khi tải dịch vụ!');
        } finally {
            this.setState({ loading: false });
        }
    };

    handleBookAppointment = (serviceId) => {
        if (!serviceId) {
            toast.error('Dịch vụ không hợp lệ!');
            return;
        }
        this.props.savePreselectInfo('Service', serviceId);
        this.props.navigate('/makeappointment');
    };

    handleSelectService = (type) => {
        this.props.selectServiceType(type);
    };

    renderServiceContent = () => {
        const { serviceType } = this.props;
        const { services } = this.state;
        const service = services.find(s => s.ServiceID === serviceType) || {};
        const { ServiceID, Price = 0 } = service;

        switch (serviceType) {
            case 1: // General Health Check
                return (
                    <div className="show-service-content-right">
                        <div className="image-container">
                            <img src={genHealthImage} alt="General Health Check" />
                        </div>
                        <h1>DỊCH VỤ KHÁM TỔNG QUÁT</h1>
                        <p>
                            Dịch vụ khám sức khỏe tổng quát thú y tại phòng khám của chúng tôi mang đến sự chăm sóc toàn diện, giúp đảm bảo sức khỏe và hạnh phúc cho thú cưng của bạn. Với đội ngũ bác sĩ thú y giàu kinh nghiệm và trang thiết bị hiện đại, chúng tôi thực hiện kiểm tra kỹ lưỡng từ đánh giá thể chất, xét nghiệm máu, siêu âm đến kiểm tra răng miệng và các cơ quan nội tạng. Mục tiêu là phát hiện sớm các vấn đề tiềm ẩn, tư vấn dinh dưỡng phù hợp và xây dựng kế hoạch chăm sóc lâu dài. Dịch vụ được thiết kế linh hoạt, phù hợp với mọi giống loài và độ tuổi của thú cưng, đảm bảo mang lại sự an tâm cho chủ nuôi trong việc duy trì cuộc sống khỏe mạnh và tràn đầy năng lượng cho người bạn đồng hành yêu quý.
                        </p>
                        <p className="service-price">Giá: {Price.toLocaleString('vi-VN')} VNĐ</p>
                        <ul className="f">
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Tổ chức nhân sự</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Trình độ chuyên môn</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Hoạt động y khoa</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Cơ sở vật chất</p></li>
                        </ul>
                        <button onClick={() => this.handleBookAppointment(ServiceID)}>Đặt lịch khám ngay !</button>
                    </div>
                );
            case 2: // Vaccination
                return (
                    <div className="show-service-content-right">
                        <img src={vaccinationImage} alt="Vaccination" />
                        <h1>DỊCH VỤ TIÊM PHÒNG</h1>
                        <p>
                            Dịch vụ tiêm phòng thú y tại phòng khám của chúng tôi giúp bảo vệ thú cưng khỏi các bệnh truyền nhiễm nguy hiểm, đảm bảo một cuộc sống khỏe mạnh và tràn đầy năng lượng. Được thực hiện bởi đội ngũ bác sĩ thú y giàu kinh nghiệm, cùng với việc sử dụng các loại vắc-xin chất lượng cao đạt tiêu chuẩn quốc tế, chúng tôi cung cấp lịch tiêm phòng khoa học, phù hợp với từng giai đoạn phát triển của thú cưng. Trước khi tiêm, bác sĩ sẽ kiểm tra sức khỏe tổng quát để đảm bảo thú cưng ở trạng thái tốt nhất, đồng thời tư vấn chi tiết về các loại vắc-xin cần thiết, thời gian tái tiêm và cách chăm sóc sau tiêm. Quy trình được thiết kế cẩn thận, an toàn và minh bạch, với sự theo dõi chặt chẽ để đảm bảo hiệu quả miễn dịch tối ưu. Dịch vụ của chúng tôi không chỉ giúp ngăn ngừa bệnh tật mà còn mang lại sự yên tâm cho chủ nuôi, biết rằng người bạn đồng hành của mình được bảo vệ toàn diện, sẵn sàng vui chơi và gắn bó lâu dài bên gia đình bạn.
                        </p>
                        <p className="service-price">Giá: {Price.toLocaleString('vi-VN')} VNĐ</p>
                        <ul className="f">
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Tổ chức nhân sự</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Trình độ chuyên môn</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Hoạt động y khoa</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Cơ sở vật chất</p></li>
                        </ul>
                        <button onClick={() => this.handleBookAppointment(ServiceID)}>Đặt lịch khám ngay !</button>
                    </div>
                );
            case 3: // Surgery
                return (
                    <div className="show-service-content-right">
                        <img src={surgeryImage} alt="Surgery" />
                        <h1>DỊCH VỤ PHẨU THUẬT CƠ BẢN</h1>
                        <p>
                            Dịch vụ phẫu thuật cơ bản cho thú cưng cung cấp các giải pháp y tế an toàn và hiệu quả, giúp cải thiện sức khỏe và chất lượng cuộc sống cho người bạn đồng hành của bạn. Với đội ngũ bác sĩ thú y giàu kinh nghiệm và cơ sở vật chất hiện đại, chúng tôi thực hiện các thủ thuật phổ biến như:
                            <li>Triệt sản</li>
                            <li>Cắt bỏ khối u hoặc u nang</li>
                            <li>Xử lý vết thương</li>
                            <li>Cắt cụt</li>
                            <li>Phẫu thuật nha khoa</li>
                            Mỗi ca phẫu thuật được tiến hành cẩn thận, từ kiểm tra sức khỏe trước phẫu thuật, gây mê an toàn đến chăm sóc hậu phẫu chu đáo, đảm bảo thú cưng hồi phục nhanh chóng. Dịch vụ được thiết kế phù hợp với mọi giống loài và tình trạng sức khỏe, mang lại sự an tâm tuyệt đối cho chủ nuôi, giúp thú cưng khỏe mạnh, vui vẻ và đồng hành lâu dài bên gia đình bạn.
                        </p>
                        <p className="service-price">Giá: {Price.toLocaleString('vi-VN')} VNĐ</p>
                        <ul className="f">
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Tổ chức nhân sự</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Trình độ chuyên môn</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Hoạt động y khoa</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Cơ sở vật chất</p></li>
                        </ul>
                        <button onClick={() => this.handleBookAppointment(ServiceID)}>Đặt lịch khám ngay !</button>
                    </div>
                );
            case 4: // Test
                return (
                    <div className="show-service-content-right">
                        <img src={testImage} alt="Test" />
                        <h1>DỊCH VỤ XÉT NGHIỆM</h1>
                        <p>
                            Dịch vụ xét nghiệm thú y tại phòng khám của chúng tôi mang đến giải pháp chẩn đoán chính xác, giúp theo dõi và bảo vệ sức khỏe toàn diện cho thú cưng của bạn. Với đội ngũ bác sĩ thú y chuyên môn cao và hệ thống thiết bị xét nghiệm hiện đại, chúng tôi thực hiện đa dạng các loại xét nghiệm như xét nghiệm máu, nước tiểu, phân, sinh hóa, và chẩn đoán hình ảnh (siêu âm, X-quang). Các xét nghiệm này giúp phát hiện sớm các vấn đề sức khỏe tiềm ẩn như nhiễm trùng, bệnh thận, gan, tiểu đường, hoặc ký sinh trùng, từ đó đưa ra phác đồ điều trị kịp thời. Quy trình được tiến hành nhanh chóng, an toàn và minh bạch, kèm theo tư vấn chi tiết để chủ nuôi hiểu rõ tình trạng của thú cưng. Dịch vụ xét nghiệm của chúng tôi phù hợp với mọi giống loài và độ tuổi, đảm bảo sự an tâm và hỗ trợ thú cưng duy trì cuộc sống khỏe mạnh, hạnh phúc bên bạn.
                        </p>
                        <p className="service-price">Giá: {Price.toLocaleString('vi-VN')} VNĐ</p>
                        <ul className="f">
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Tổ chức nhân sự</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Trình độ chuyên môn</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Hoạt động y khoa</p></li>
                            <li className="f"><img src={iconImage} alt="Icon" /><p>Cơ sở vật chất</p></li>
                        </ul>
                        <button onClick={() => this.handleBookAppointment(ServiceID)}>Đặt lịch khám ngay !</button>
                    </div>
                );
            default:
                return (
                    <div className="show-service-content-right">
                        <h1>Dịch vụ không tồn tại</h1>
                        <p>Vui lòng chọn một dịch vụ hợp lệ.</p>
                    </div>
                );
        }
    };

    render() {
        const { loading, serviceType } = this.state;

        return (
            <div className="show-service-body">
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <>
                        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
                        <div className="show-service-content f gen-container">
                            <div className="show-service-content-left">
                                <ul>
                                    <li><p>Dịch Vụ Khác</p></li>
                                    <li>
                                        <p className={serviceType === 1 ? 'active' : ''} onClick={() => this.handleSelectService(1)}>Khám Tổng Quát</p>
                                    </li>
                                    <li>
                                        <p className={serviceType === 2 ? 'active' : ''} onClick={() => this.handleSelectService(2)}>Tiêm Phòng</p>
                                    </li>
                                    <li>
                                        <p className={serviceType === 3 ? 'active' : ''} onClick={() => this.handleSelectService(3)}>Phẫu Thuật Cơ Bản</p>
                                    </li>
                                    <li>
                                        <p className={serviceType === 4 ? 'active' : ''} onClick={() => this.handleSelectService(4)}>Xét Nghiệm</p>
                                    </li>
                                </ul>
                            </div>
                            {this.renderServiceContent()}
                        </div>
                        <Footer />
                    </>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    serviceType: state.preselect.serviceType,
    userInfo: state.user.userInfo,
    cartItems: state.cart.cartItems,
});

const mapDispatchToProps = {
    savePreselectInfo,
    selectServiceType,
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowService);