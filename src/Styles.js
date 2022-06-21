import { TextField, Fab, Fade, Grid, Pagination } from '@mui/material';
import { styled } from '@mui/material/styles';

export const drawerWidth = 240;

export const Root = styled("div")`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`;

export const Fader = styled(Fade)`
  margin-top: 10px;
`;

export const TableFab = styled(Fab)`
  margin: 0;
  padding: 0;
  box-shadow: none;
`;

export const TableGrid = styled(Grid)`
  & .MuiGrid-item {
    padding-top: 0;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 2px;
    padding-right: 10px;
  };
  & .MuiGrid-item:last-child {
    padding-right: 2px;
  };
  margin: 0;
`;

export const TreeViewPort = styled("div")`
  height: calc(100vh - 170px);
`;

export const DropZone = styled("div")`
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: #e0e0e0;
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;

export const Pager = styled(Pagination)`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;