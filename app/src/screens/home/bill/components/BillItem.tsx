import {ImageSourcePropType} from 'react-native';

type BillItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  bgColor: string;
  categoryColor: string;
  categoryTextColor: string;
  image: ImageSourcePropType;
};

export default BillItem;
