
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const MySwal = Swal.mixin({
  customClass: {
    popup: "swal2-custom-popup",
    title: "swal2-custom-title",
    htmlContainer: "swal2-custom-content",
    confirmButton: "swal2-custom-confirm",
    cancelButton: "swal2-custom-cancel",
  },
  buttonsStyling: false,
  background: "transparent",
  backdrop: `
    rgba(0,0,0,0.65)
  `,
});

export default MySwal;
