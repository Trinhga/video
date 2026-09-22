import { VehicleType, ViolationEvidence } from '../types/traffic';

export interface DilemmaCalculationResult {
  vKmh: number;
  vMs: number;
  reactionTime: number;
  yellowDuration: number;
  maxDeceleration: number;
  intersectionWidth: number;
  stoppingDistance: number; // Xs
  clearingDistance: number; // Xc
  hasDilemmaZone: boolean;
  dilemmaZoneLength: number;
  hasOptionZone: boolean;
  optionZoneLength: number;
  minRecommendedYellowTime: number;
}

/**
 * Tính toán vùng tiến thoái lưỡng nan (Dilemma Zone) theo ITE (Institute of Transportation Engineers)
 */
export function calculateDilemmaZone(params: {
  speedKmh: number;
  reactionTimeSec: number;
  yellowDurationSec: number;
  frictionCoeff: number;
  intersectionWidthMeters: number;
  vehicleLengthMeters: number;
}): DilemmaCalculationResult {
  const vMs = (params.speedKmh * 1000) / 3600;
  const g = 9.81;
  const aMax = params.frictionCoeff * g; // m/s^2

  // Khoảng cách dừng an toàn: Xs = v * tr + v^2 / (2 * a)
  const stoppingDistance = vMs * params.reactionTimeSec + (vMs * vMs) / (2 * aMax);

  // Khoảng cách tối đa xe có thể vượt qua an toàn trong pha vàng: Xc = v * Y - (W + L)
  const clearingDistance = vMs * params.yellowDurationSec - (params.intersectionWidthMeters + params.vehicleLengthMeters);

  const hasDilemmaZone = stoppingDistance > clearingDistance;
  const dilemmaZoneLength = hasDilemmaZone ? stoppingDistance - clearingDistance : 0;

  const hasOptionZone = clearingDistance > stoppingDistance;
  const optionZoneLength = hasOptionZone ? clearingDistance - stoppingDistance : 0;

  // Thời gian đèn vàng tối thiểu khuyến nghị theo ITE để loại bỏ hoàn toàn Dilemma Zone:
  // Y_min = tr + v / (2 * a) + (W + L) / v
  const minRecommendedYellowTime = params.reactionTimeSec + vMs / (2 * aMax) + (params.intersectionWidthMeters + params.vehicleLengthMeters) / vMs;

  return {
    vKmh: params.speedKmh,
    vMs: Number(vMs.toFixed(2)),
    reactionTime: params.reactionTimeSec,
    yellowDuration: params.yellowDurationSec,
    maxDeceleration: Number(aMax.toFixed(2)),
    intersectionWidth: params.intersectionWidthMeters,
    stoppingDistance: Number(stoppingDistance.toFixed(2)),
    clearingDistance: Number(Math.max(0, clearingDistance).toFixed(2)),
    hasDilemmaZone,
    dilemmaZoneLength: Number(dilemmaZoneLength.toFixed(2)),
    hasOptionZone,
    optionZoneLength: Number(optionZoneLength.toFixed(2)),
    minRecommendedYellowTime: Number(minRecommendedYellowTime.toFixed(2)),
  };
}

/**
 * Tra cứu quy định mức phạt theo Nghị định 100/2019/NĐ-CP & Nghị định 123/2021/NĐ-CP
 */
export function getPenaltyInfo(type: VehicleType, isOverstepOnly: boolean) {
  if (isOverstepOnly) {
    // Lỗi không chấp hành hiệu lệnh, chỉ dẫn của biển báo, vạch kẻ đường (dừng đè vạch)
    switch (type) {
      case 'car':
        return {
          legalRef: 'Điểm a Khoản 1 Điều 5 Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP)',
          fineAmount: '300.000 VNĐ - 400.000 VNĐ',
          licensePenalty: 'Không tước giấy phép lái xe',
          violationTitle: 'Không chấp hành vạch kẻ đường (Dừng xe đè vạch)',
        };
      case 'motorcycle':
        return {
          legalRef: 'Điểm a Khoản 1 Điều 6 Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP)',
          fineAmount: '100.000 VNĐ - 200.000 VNĐ',
          licensePenalty: 'Không tước giấy phép lái xe',
          violationTitle: 'Không chấp hành vạch kẻ đường (Dừng xe đè vạch)',
        };
      case 'truck':
        return {
          legalRef: 'Điểm a Khoản 1 Điều 5 Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP)',
          fineAmount: '300.000 VNĐ - 400.000 VNĐ',
          licensePenalty: 'Không tước giấy phép lái xe',
          violationTitle: 'Không chấp hành vạch kẻ đường (Dừng xe đè vạch)',
        };
      default:
        return {
          legalRef: 'Nghị định 100/2019/NĐ-CP',
          fineAmount: '100.000 VNĐ - 200.000 VNĐ',
          licensePenalty: 'Không tước bằng lái',
          violationTitle: 'Dừng đè vạch tín hiệu',
        };
    }
  }

  // Lỗi vượt đèn đỏ (Không chấp hành hiệu lệnh của đèn tín hiệu giao thông)
  switch (type) {
    case 'car':
      return {
        legalRef: 'Điểm a Khoản 5 và Điểm b, c Khoản 11 Điều 5 Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP)',
        fineAmount: '4.000.000 VNĐ - 6.000.000 VNĐ',
        licensePenalty: 'Tước quyền sử dụng Giấy phép lái xe từ 01 tháng đến 03 tháng (gây tai nạn: 02 - 04 tháng)',
        violationTitle: 'Không chấp hành hiệu lệnh của đèn tín hiệu giao thông (Vượt đèn đỏ)',
      };
    case 'motorcycle':
      return {
        legalRef: 'Điểm e Khoản 4 và Điểm b, c Khoản 10 Điều 6 Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP)',
        fineAmount: '800.000 VNĐ - 1.000.000 VNĐ',
        licensePenalty: 'Tước quyền sử dụng Giấy phép lái xe từ 01 tháng đến 03 tháng',
        violationTitle: 'Không chấp hành hiệu lệnh của đèn tín hiệu giao thông (Vượt đèn đỏ)',
      };
    case 'truck':
      return {
        legalRef: 'Điểm a Khoản 5 Điều 5 Nghị định 100/2019/NĐ-CP',
        fineAmount: '4.000.000 VNĐ - 6.000.000 VNĐ',
        licensePenalty: 'Tước quyền sử dụng Giấy phép lái xe từ 01 tháng đến 03 tháng',
        violationTitle: 'Không chấp hành hiệu lệnh đèn tín hiệu (Vượt đèn đỏ - Xe tải)',
      };
    case 'ambulance':
      return {
        legalRef: 'Điều 22 Luật Giao thông đường bộ 2008 & Luật TTATGTĐB 2024 (Quyền ưu tiên của một số loại xe)',
        fineAmount: '0 VNĐ (Miễn trừ pháp lý)',
        licensePenalty: 'Không áp dụng hình thức xử phạt',
        violationTitle: 'Xe ưu tiên đang thực hiện nhiệm vụ khẩn cấp (Hợp pháp)',
      };
  }
}

/**
 * Sinh gói hồ sơ bằng chứng 3 khung hình chuẩn Cục Cảnh sát Giao thông
 */
export function createMockViolationEvidence(
  plate: string,
  vehicleType: VehicleType,
  speedKmh: number,
  redElapsedSec: number,
  isOverstepOnly: boolean = false
): ViolationEvidence {
  const penalty = getPenaltyInfo(vehicleType, isOverstepOnly);
  const now = new Date();
  const timestamp = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN') + '.' + Math.floor(now.getMilliseconds());
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const id = `VP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randomCode}`;

  const isEmergency = vehicleType === 'ambulance';

  return {
    id,
    vehiclePlate: plate,
    vehicleType,
    timestamp,
    location: 'Nút giao thông QL1A - Đường 3/2 (Km 12+450)',
    speedAtViolation: Math.round(speedKmh),
    redLightDurationAtViolation: Number(redElapsedSec.toFixed(2)),
    violationType: isEmergency 
      ? 'EXEMPT_EMERGENCY' 
      : isOverstepOnly 
        ? 'STOP_LINE_OVERSTEP' 
        : 'RED_LIGHT_VIOLATION',
    legalRef: penalty.legalRef,
    fineAmount: penalty.fineAmount,
    licensePenalty: penalty.licensePenalty,
    frames: {
      frame1: {
        description: 'Khung hình 1: Xe tiếp cận trước vạch dừng, đèn tín hiệu đã chuyển đỏ.',
        timeOffset: 'T - 0.42s',
        vehiclePos: 'Cách vạch dừng 2.8 mét',
        lightState: 'Đèn đỏ (Bật được 0.8s)',
      },
      frame2: {
        description: isOverstepOnly 
          ? 'Khung hình 2: Bánh xe đè qua vạch dừng số 7.1, xe bắt đầu dừng hẳn.'
          : 'Khung hình 2: Toàn bộ thân xe vượt qua vạch dừng số 7.1 khi đèn đỏ.',
        timeOffset: 'T + 0.00s',
        vehiclePos: 'Đè / Vừa qua vạch dừng',
        lightState: 'Đèn đỏ (Bật được 1.2s)',
      },
      frame3: {
        description: isOverstepOnly 
          ? 'Khung hình 3: Xe dừng đứng yên tại chỗ, không di chuyển vào giao lộ.'
          : 'Khung hình 3: Xe di chuyển sâu vào vùng tâm giao lộ khi pha đèn đỏ tiếp diễn.',
        timeOffset: 'T + 0.65s',
        vehiclePos: isOverstepOnly ? 'Dừng tại vạch người đi bộ' : 'Tâm ngã tư (+14m)',
        lightState: 'Đèn đỏ (Bật được 1.8s)',
      },
    },
    hash: 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    status: isEmergency ? 'DISMISSED' : 'VERIFIED',
  };
}
