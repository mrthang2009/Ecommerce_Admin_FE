import { useState } from "react";
import { Upload, Button, Row, Modal } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

// const beforeUpload = (file) => {
//   const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
//   if (!isJpgOrPng) {
//     message.error("Bạn chỉ có thể tải lên tệp JPG/PNG!");
//   }
//   const isLt2M = file.size / 1024 / 1024 < 2;
//   if (!isLt2M) {
//     message.error("Hình ảnh phải nhỏ hơn 2MB!");
//   }
//   return isJpgOrPng && isLt2M;
// };

const AvatarUpload = ({ handleCancel, uploadAvatar }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleChange = (info) => {
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, () => {
        setFile(info.file);
        setLoading(false);
        handlePreview(info.file);
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Chọn ảnh
      </div>
    </div>
  );

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj, (url) => {
        // Cập nhật trạng thái preview sau khi có dữ liệu base64
        setPreviewImage(url);
        setPreviewOpen(true);
        setPreviewTitle(
          file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
        );
      });
    } else {
      setPreviewImage(file.url || file.preview);
      setPreviewOpen(true);
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
      );
    }
  };

  return (
    <>
      <Upload
        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
        listType="picture-circle"
        onPreview={handlePreview}
        onChange={handleChange}
        name="avatar"
      >
        {file ? (
          <img
            src={file.url || file.preview}
            alt="avatar"
            style={{
              width: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img
          alt="example"
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>
      <Row justify="end">
        <Button onClick={handleCancel}>Hủy</Button>
        <Button
          type="primary"
          htmlType="button"
          style={{ marginLeft: "10px" }}
          onClick={uploadAvatar}
        >
          Lưu
        </Button>
      </Row>
    </>
  );
};

AvatarUpload.propTypes = {
  handleCancel: PropTypes.func,
  uploadAvatar: PropTypes.func,
};

export default AvatarUpload;
